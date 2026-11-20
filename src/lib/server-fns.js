import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireUser } from "@/lib/auth-middleware";
import {
  DEMO_CASE,
  DEMO_CITATIONS,
  DEMO_DRAFT,
  DEMO_ISSUE,
  DEMO_RECORDS,
  DEMO_TASKS,
  DEMO_TIMELINE,
} from "@/lib/demoData";

const asItems = (result) => (Array.isArray(result) ? result : result?.items || []);

const representationLine = (workspace) => {
  const state = workspace?.representation || "Represented by counsel";
  if (state === "Self-represented") {
    return "The parent is self-represented and speaks for themselves. Explain procedural words in plain language, never assume they know filing, service or hearing rules, and never tell them a document is ready to file.";
  }
  if (state === "Limited-scope or standby counsel") {
    return `The parent has limited-scope or standby counsel${workspace?.counsel_name ? ` (${workspace.counsel_name})` : ""}. Say which items fall inside that scope and which the parent may need to handle themselves, without assuming either way.`;
  }
  if (state === "Representation uncertain or changing") {
    return "The parent's representation is uncertain or changing. Write plainly and portably, do not assume an attorney will act, and never tell the parent a document is ready to file or serve.";
  }
  return `The parent is represented by counsel${workspace?.counsel_name ? ` (${workspace.counsel_name})` : ""}. Write so the attorney can act quickly: say which items need counsel's judgment, and never suggest the parent file or serve anything themselves.`;
};

const EPISTEMIC = [
  "Allegation",
  "Observation",
  "Parent Recollection",
  "Professional Opinion",
  "Inference",
  "Court Finding",
];

/* ------------------------------------------------------------------ *
 * Demo workspace seeding
 * ------------------------------------------------------------------ */
export const ensureDemoWorkspace = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .handler(async ({ context }) => {
    const base44 = context.getBase44();
    let existing = asItems(
      await base44.entities.CaseWorkspace.list({ sort: "-created_date", limit: 20 })
    );
    if (existing.length > 0) {
      // Another request (or tab) may still be seeding the demo workspace. Wait for it
      // to finish so the caller never reads a half-built case.
      const pending = existing.find((item) => item.status === "Intake");
      if (pending) {
        for (let attempt = 0; attempt < 12; attempt += 1) {
          await new Promise((resolve) => setTimeout(resolve, 350));
          const refreshed = await base44.entities.CaseWorkspace.get(pending.id).catch(() => null);
          if (!refreshed || refreshed.status !== "Intake") break;
        }
        existing = asItems(
          await base44.entities.CaseWorkspace.list({ sort: "-created_date", limit: 20 })
        );
      }
      return { cases: existing, activeCase: existing[0] };
    }

    const workspace = await base44.entities.CaseWorkspace.create({
      title: DEMO_CASE.title,
      case_number: DEMO_CASE.case_number,
      jurisdiction: DEMO_CASE.jurisdiction,
      status: "Intake",
      representation: "Represented by counsel",
      counsel_name: "Counsel of record",
    });

    const records = await base44.entities.EvidenceRecord.bulkCreate(
      DEMO_RECORDS.map((record) => ({
        case_id: workspace.id,
        title: record.title,
        category: record.category,
        source_author: record.source_author,
        event_date: record.event_date,
        documented_date: record.documented_date,
        raw_text: record.pages.join("\n\n"),
        pages: record.pages,
        verification_status: record.verification_status,
      }))
    );
    const recordIdByKey = {};
    DEMO_RECORDS.forEach((record, index) => {
      recordIdByKey[record.key] = records[index]?.id;
    });

    const issue = await base44.entities.InvestigativeIssue.create({
      case_id: workspace.id,
      title: DEMO_ISSUE.title,
      summary: DEMO_ISSUE.summary,
      what_agrees: DEMO_ISSUE.what_agrees,
      what_contradicts: DEMO_ISSUE.what_contradicts,
      missing_records_needed: DEMO_ISSUE.missing_records_needed,
      alternative_explanations: DEMO_ISSUE.alternative_explanations,
      status: DEMO_ISSUE.status,
      linked_citation_ids: [],
    });

    const citations = await base44.entities.StatementCitation.bulkCreate(
      DEMO_CITATIONS.map((citation) => ({
        case_id: workspace.id,
        record_id: recordIdByKey[citation.record_key],
        page_number: citation.page_number,
        exact_quote: citation.exact_quote,
        epistemic_type: citation.epistemic_type,
        linked_issue_id: issue.id,
      }))
    );
    const citationIdByKey = {};
    DEMO_CITATIONS.forEach((citation, index) => {
      citationIdByKey[citation.key] = citations[index]?.id;
    });

    await base44.entities.InvestigativeIssue.update(issue.id, {
      linked_citation_ids: DEMO_ISSUE.linked_citation_keys
        .map((key) => citationIdByKey[key])
        .filter(Boolean),
    });

    await base44.entities.TimelineEvent.bulkCreate(
      DEMO_TIMELINE.map((event) => ({
        case_id: workspace.id,
        title: event.title,
        event_date: event.event_date,
        documented_date: event.documented_date,
        description: event.description,
        discrepancy_flag: event.discrepancy_flag,
        linked_record_ids: event.linked_record_keys.map((key) => recordIdByKey[key]).filter(Boolean),
      }))
    );

    await base44.entities.ActionTask.bulkCreate(
      DEMO_TASKS.map((task) => ({
        case_id: workspace.id,
        title: task.title,
        stage: task.stage,
        due_date: task.due_date,
        completed: task.completed,
        linked_issue_id: issue.id,
      }))
    );

    await base44.entities.DraftDocument.create({
      case_id: workspace.id,
      title: DEMO_DRAFT.title,
      draft_type: DEMO_DRAFT.draft_type,
      content: DEMO_DRAFT.content,
      status: DEMO_DRAFT.status,
      linked_citation_ids: DEMO_DRAFT.linked_citation_keys
        .map((key) => citationIdByKey[key])
        .filter(Boolean),
    });

    await base44.entities.AuditLog.create({
      case_id: workspace.id,
      entity_type: "CaseWorkspace",
      entity_id: workspace.id,
      entity_label: workspace.title,
      action: "created",
      detail: `Demo workspace created with ${records.length} records, ${citations.length} tagged statements, and 1 investigative issue.`,
    });

    const activated = await base44.entities.CaseWorkspace.update(workspace.id, { status: "Active" });

    return { cases: [activated || { ...workspace, status: "Active" }], activeCase: activated };
  });

/* ------------------------------------------------------------------ *
 * Source-grounded case assistant
 * ------------------------------------------------------------------ */
const buildRecordContext = (records) =>
  records
    .map((record) => {
      const pages = record.pages?.length ? record.pages : [record.raw_text || ""];
      const pageText = pages
        .map((text, index) => `--- page ${index + 1} ---\n${(text || "").slice(0, 3500)}`)
        .join("\n");
      return `RECORD_ID: ${record.id}
TITLE: ${record.title}
CATEGORY: ${record.category}
AUTHOR: ${record.source_author || "not recorded"}
EVENT DATE: ${record.event_date || "not recorded"}
DOCUMENTED DATE: ${record.documented_date || "not recorded"}
${pageText}`;
    })
    .join("\n\n");

const loadCase = async (base44, caseId) => {
  const workspace = await base44.entities.CaseWorkspace.get(caseId);
  const records = asItems(
    await base44.entities.EvidenceRecord.filter(
      { case_id: caseId },
      { sort: "event_date", limit: 25 }
    )
  );
  return { workspace, records };
};

const citeableRecords = (records) =>
  records
    .filter((record) => (record.raw_text || record.pages?.length) && record.category !== "Photo")
    .slice(0, 10);

const groundCitations = (citations, records) => {
  const byId = new Map(records.map((record) => [record.id, record]));
  const grounded = [];
  for (const citation of citations || []) {
    const record = byId.get(citation?.record_id);
    if (!record || !citation?.quote) continue;
    const pages = record.pages?.length ? record.pages : [record.raw_text || ""];
    const needle = citation.quote.trim().replace(/\s+/g, " ");
    let pageIndex = pages.findIndex((page) =>
      (page || "").replace(/\s+/g, " ").includes(needle)
    );
    if (pageIndex < 0) {
      pageIndex = pages.findIndex((page) => {
        const probe = needle.split(" ").slice(0, 6).join(" ");
        return probe.length > 10 && (page || "").replace(/\s+/g, " ").includes(probe);
      });
    }
    if (pageIndex < 0) continue;
    grounded.push({
      record_id: record.id,
      record_title: record.title,
      page_number: pageIndex + 1,
      quote: citation.quote.trim(),
      epistemic_type: EPISTEMIC.includes(citation.epistemic_type)
        ? citation.epistemic_type
        : "Observation",
      note: citation.note || "",
    });
    if (grounded.length >= 6) break;
  }
  return grounded;
};

export const askCaseAssistant = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      caseId: z.string().min(1),
      question: z.string().min(1).max(1200),
    })
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const { workspace, records } = await loadCase(base44, data.caseId);
    const usable = citeableRecords(records);
    if (usable.length === 0) {
      return {
        answer:
          "There are no readable records in this case yet, so there is nothing I can ground an answer in. Add a record first, and I can point to the exact page and sentence.",
        verified_facts: [],
        unverified_or_missing: ["No records are stored in this case workspace."],
        uncertainty: "Nothing can be verified without source records.",
        citations: [],
        suggested_action: {
          label: "Add records",
          kind: "evidence",
          reason: "The assistant needs at least one record to cite.",
        },
      };
    }

    const citations = asItems(
      await base44.entities.StatementCitation.filter({ case_id: data.caseId }, { limit: 60 })
    );
    const citationLines = citations
      .slice(0, 25)
      .map((citation) => {
        const record = records.find((item) => item.id === citation.record_id);
        return `- "${citation.exact_quote}" [${record?.title || "record"} · p. ${citation.page_number}] tagged ${citation.epistemic_type}`;
      })
      .join("\n");

    const prompt = `You are the case conversation assistant inside WE THE PARENT, a workspace for parents navigating child welfare and dependency court.

GUIDING PRINCIPLE: The AI assists. The evidence informs. The parent decides.

HARD RULES
1. Use ONLY the records below. Never introduce outside facts, law, statutes, deadlines, or outcomes for this case.
2. Never state or imply which person is right or wrong, that anyone lied, or that any account is true. Describe what each record says.
3. Never give legal advice, predict a ruling, or tell the parent what will happen.
4. Distinguish what was alleged from what was observed, what the parent recalls, professional opinion, inference, and what a court ordered.
5. If the records do not answer the question, say so plainly and name the record that is missing.
6. Every factual claim in "answer" must be supported by a citation from the list you return, quoted verbatim from the page text below.
7. Plain everyday language, no legal jargon without a short explanation.

ALREADY TAGGED STATEMENTS
${citationLines || "None tagged yet."}

RECORDS
${buildRecordContext(usable)}

WHO THE PARENT IS
${representationLine(workspace)}

PARENT'S QUESTION
"${data.question}"

Return JSON. "answer" is 2 to 4 short paragraphs in plain language, separating what the records show from what remains unverified. "citations" holds 1 to 6 verbatim quotes copied exactly from the page text, each 8 to 45 words.`;

    const llm = context.getBase44().asServiceRole.integrations.Core;
    const result = await llm.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          answer: { type: "string" },
          verified_facts: { type: "array", items: { type: "string" } },
          unverified_or_missing: { type: "array", items: { type: "string" } },
          uncertainty: { type: "string" },
          citations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                record_id: { type: "string" },
                quote: { type: "string" },
                epistemic_type: { type: "string", enum: EPISTEMIC },
                note: { type: "string" },
              },
              required: ["record_id", "quote", "epistemic_type"],
            },
          },
          suggested_action: {
            type: "object",
            properties: {
              label: { type: "string" },
              kind: { type: "string", enum: ["timeline", "issue", "evidence", "draft"] },
              reason: { type: "string" },
            },
            required: ["label", "kind"],
          },
        },
        required: ["answer", "citations"],
      },
    });

    const grounded = groundCitations(result?.citations, usable);
    const suggested = Array.isArray(result?.citations) ? result.citations.length : 0;

    return {
      answer: result?.answer || "",
      verified_facts: result?.verified_facts || [],
      unverified_or_missing: result?.unverified_or_missing || [],
      uncertainty: result?.uncertainty || "",
      citations: grounded,
      // Suggested quotations that could not be matched to a page are withheld,
      // and the limitation is shown rather than silently dropped.
      citation_limitations: Math.max(0, suggested - grounded.length),
      suggested_action: result?.suggested_action || null,
    };
  });

/* ------------------------------------------------------------------ *
 * Source-linked drafting
 * ------------------------------------------------------------------ */
export const generateDraft = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(
    z.object({
      caseId: z.string().min(1),
      draftType: z.enum([
        "Attorney Questions",
        "Court Questions",
        "Record Request",
        "Hearing Packet",
        "Timeline Summary",
      ]),
      issueId: z.string().optional().nullable(),
      instruction: z.string().max(800).optional().nullable(),
    })
  )
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const { workspace, records } = await loadCase(base44, data.caseId);
    const usable = citeableRecords(records);
    const citations = asItems(
      await base44.entities.StatementCitation.filter({ case_id: data.caseId }, { limit: 60 })
    );
    const issue = data.issueId
      ? await base44.entities.InvestigativeIssue.get(data.issueId).catch(() => null)
      : null;

    const citationLines = citations
      .filter((citation) => !issue || !citation.linked_issue_id || citation.linked_issue_id === issue.id)
      .slice(0, 30)
      .map((citation) => {
        const record = records.find((item) => item.id === citation.record_id);
        return `- "${citation.exact_quote}" [${record?.title || "record"} · p. ${citation.page_number}] ${citation.epistemic_type}`;
      })
      .join("\n");

    const prompt = `You are the drafting assistant inside WE THE PARENT.
${representationLine(workspace)}

HARD RULES
- Use only the records and tagged statements provided.
- Never give legal advice, never assert that a person is right or wrong, never claim a document was filed or served.
- Write in plain language. Cite every assertion inline in the exact form [Record title · p. N].
- The content must begin with the line: DRAFT — NOT FILED OR SERVED
- Type "${data.draftType}": ${
      data.draftType === "Court Questions"
        ? "numbered questions the parent can put to the court themselves, each tied to a citation, in plain language a judge can follow."
        : data.draftType === "Attorney Questions"
        ? "numbered questions the parent can ask counsel, each tied to a citation."
        : data.draftType === "Record Request"
          ? "a short, polite written request listing exactly which records are missing and why each matters, tied to citations."
          : data.draftType === "Timeline Summary"
            ? "a numbered chronology with the event date, the documented date, and the supporting citation for each entry."
            : "a hearing packet outline: issues to address, key exhibits, priority questions, and the stated goal of the hearing."
    }

${issue ? `ISSUE UNDER INVESTIGATION\nTitle: ${issue.title}\nSummary: ${issue.summary || ""}\nWhat agrees: ${issue.what_agrees || ""}\nWhat contradicts: ${issue.what_contradicts || ""}\nMissing records: ${issue.missing_records_needed || ""}\nAlternative explanations: ${issue.alternative_explanations || ""}` : "No single issue selected."}

TAGGED STATEMENTS
${citationLines || "None tagged yet."}

RECORDS
${buildRecordContext(usable)}

${data.instruction ? `PARENT'S SPECIFIC REQUEST\n${data.instruction}` : ""}

Return JSON with "title" (short, specific) and "content" (plain text with the DRAFT line first, then the organized material).`;

    const llm = base44.asServiceRole.integrations.Core;
    const result = await llm.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          content: { type: "string" },
        },
        required: ["title", "content"],
      },
    });

    const content = (result?.content || "").trim();
    return {
      title: result?.title || `${data.draftType} draft`,
      content: content.startsWith("DRAFT")
        ? content
        : `DRAFT — NOT FILED OR SERVED\n\n${content}`,
    };
  });

/* ------------------------------------------------------------------ *
 * Document text extraction
 * ------------------------------------------------------------------ */
export const extractRecordText = createServerFn({ method: "POST" })
  .middleware([requireUser])
  .validator(z.object({ fileUrl: z.string().url().max(2000) }))
  .handler(async ({ data, context }) => {
    const base44 = context.getBase44();
    const result = await base44.asServiceRole.integrations.Core.ExtractDataFromUploadedFile({
      file_url: data.fileUrl,
      json_schema: {
        type: "object",
        properties: {
          text: { type: "string", description: "Full readable text of the document" },
          pages: {
            type: "array",
            items: { type: "string" },
            description: "The same text split page by page, in order",
          },
        },
        required: ["text"],
      },
    });

    if (result?.status !== "success") {
      return { text: "", pages: [], error: result?.details || "The file could not be read." };
    }
    const output = result.output || {};
    const text = typeof output === "string" ? output : output.text || "";
    const pages =
      Array.isArray(output.pages) && output.pages.length
        ? output.pages.filter(Boolean)
        : text
          ? [text]
          : [];
    return { text, pages, error: null };
  });