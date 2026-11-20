import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  Check,
  Sparkles,
  ClipboardList,
  FileSearch,
  Scale,
} from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import IssueFormDialog from "@/components/issues/IssueFormDialog";
import AuditTrail from "@/components/common/AuditTrail";
import { EpistemicTag } from "@/components/shell/StatementTags";
import { goldButton, ghostButton, inputClass, labelClass } from "@/components/common/FormField";
import { useCase } from "@/components/case/CaseContext";
import { getVoice } from "@/lib/representation";
import { useSourceViewer } from "@/components/shell/SourceViewerContext";
import { ISSUE_STATUS_OPTIONS, formatDate } from "@/lib/domain";
import { base44 } from "@/api/base44Client";
import { logAudit } from "@/lib/audit";
import { generateDraft } from "@/lib/server-fns";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/_authed/issues/$issueId")({
  head: () => ({ meta: [{ title: "Investigation · WE THE PARENT™" }] }),
  component: IssueDetailPage,
});

const emptyForm = {
  what_agrees: "",
  what_contradicts: "",
  missing_records_needed: "",
  alternative_explanations: "",
};

function IssueDetailPage() {
  const { issueId } = Route.useParams();
  const navigate = useNavigate();
  const { issues, citations, records, activeCase, loading, reload } = useCase();
  const voice = getVoice(activeCase);
  const { openSource } = useSourceViewer();
  const generate = useServerFn(generateDraft);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  const issue = issues.find((item) => item.id === issueId);

  useEffect(() => {
    if (!issue) return;
    setForm({
      what_agrees: issue.what_agrees || "",
      what_contradicts: issue.what_contradicts || "",
      missing_records_needed: issue.missing_records_needed || "",
      alternative_explanations: issue.alternative_explanations || "",
    });
  }, [issue?.id, issue?.updated_date]);

  if (!issue) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 py-10 text-center">
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-brand-body/72">
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
            Loading investigation…
          </div>
        ) : (
          <>
            <p className="font-heading text-[22px] text-[#F9EBE5]">This issue is not in your workspace.</p>
            <Link to="/issues" className={ghostButton}>
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
              Back to issues
            </Link>
          </>
        )}
      </div>
    );
  }

  const linked = citations.filter((citation) => citation.linked_issue_id === issue.id);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const saveIssue = async (payload) => {
    await base44.entities.InvestigativeIssue.update(issue.id, payload);
    await logAudit({
      caseId: issue.case_id,
      entityType: "InvestigativeIssue",
      entityId: issue.id,
      entityLabel: payload.title || issue.title,
      action: "updated",
      detail: `Issue details updated. Previous status: ${issue.status}.`,
      previousValue: issue.summary || "",
    });
    toast.success("Issue updated.");
    reload();
  };

  const saveAnalysis = async () => {
    setSaving(true);
    try {
      await base44.entities.InvestigativeIssue.update(issue.id, form);
      await logAudit({
        caseId: issue.case_id,
        entityType: "InvestigativeIssue",
        entityId: issue.id,
        entityLabel: issue.title,
        action: "corrected",
        detail: "Investigation analysis saved: agreement, contradiction, missing records, alternative explanations.",
        previousValue: issue.what_contradicts || "",
      });
      toast.success("Analysis saved with your reasoning intact.");
      reload();
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (status) => {
    await base44.entities.InvestigativeIssue.update(issue.id, { status });
    await logAudit({
      caseId: issue.case_id,
      entityType: "InvestigativeIssue",
      entityId: issue.id,
      entityLabel: issue.title,
      action: "updated",
      detail: `Status changed to ${status}.`,
      previousValue: issue.status,
    });
    toast.success(`Issue marked ${status}.`);
    reload();
  };

  const addFollowUpTask = async () => {
    const title = (form.missing_records_needed || `Request missing records for ${issue.title}`).slice(0, 140);
    await base44.entities.ActionTask.create({
      case_id: issue.case_id,
      title,
      stage: "Record Comparison",
      due_date: null,
      completed: false,
      linked_issue_id: issue.id,
    });
    await logAudit({
      caseId: issue.case_id,
      entityType: "ActionTask",
      entityId: issue.id,
      entityLabel: issue.title,
      action: "created",
      detail: `Follow-up task created from the missing records section.`,
    });
    toast.success("Follow-up task created.");
    reload();
  };

  const generateQuestions = async () => {
    setGenerating(true);
    try {
      const draft = await generate({
        data: { caseId: issue.case_id, draftType: voice.questionDraftType, issueId: issue.id },
      });
      const created = await base44.entities.DraftDocument.create({
        case_id: issue.case_id,
        title: draft.title,
        draft_type: voice.questionDraftType,
        content: draft.content,
        status: "DRAFT - NOT FILED",
        linked_citation_ids: linked.map((citation) => citation.id),
      });
      await logAudit({
        caseId: issue.case_id,
        entityType: "DraftDocument",
        entityId: created.id,
        entityLabel: created.title,
        action: "created",
        detail: `Source-linked question list drafted for issue "${issue.title}". Status: DRAFT - NOT FILED.`,
      });
      toast.success("Draft created. It is marked DRAFT — NOT FILED OR SERVED.");
      reload();
      navigate({ to: "/drafts/$draftId", params: { draftId: created.id } });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 pb-8">
      <Link to="/issues" className="inline-flex items-center gap-1.5 text-[12px] text-brand-glint hover:text-[#F9EBE5]">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        All issues
      </Link>

      <PageHeader
        eyebrow="Investigative issue"
        title={issue.title}
        description={issue.summary || "No summary recorded yet."}
        actions={
          <>
            <select
              value={issue.status}
              onChange={(event) => changeStatus(event.target.value)}
              className={`${inputClass} w-auto`}
            >
              {ISSUE_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <button type="button" className={ghostButton} onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
              Edit
            </button>
          </>
        }
      />

      <section className="glass-frosted rounded-xl p-4">
        <div className="flex items-center gap-2">
          <FileSearch className="h-4 w-4 text-[#D4B483]" strokeWidth={1.5} />
          <p className="eyebrow">1 · what each source says</p>
        </div>
        {linked.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-[#E6C2BF]/25 p-4">
            <p className="text-[12.5px] leading-relaxed text-brand-body/72">
              No statements are connected yet. Open a record, tag the exact sentence, and link it to
              this issue. Only the original wording belongs here.
            </p>
            <Link to="/evidence" className={`${ghostButton} mt-3`}>
              Open evidence library
            </Link>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {linked.map((citation) => {
              const record = records.find((item) => item.id === citation.record_id);
              return (
                <button
                  key={citation.id}
                  type="button"
                  onClick={() =>
                    record &&
                    openSource(record, {
                      page: Number(citation.page_number) || 1,
                      quote: citation.exact_quote,
                    })
                  }
                  className="reactive-card block w-full rounded-lg border border-[#E6C2BF]/20 bg-[#131414]/40 p-3 text-left"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11.5px] font-medium text-brand-body/92">
                      {record?.title || "Record"}
                    </span>
                    <div className="flex items-center gap-2">
                      <EpistemicTag type={citation.epistemic_type} />
                      <span className="font-mono text-[10px] text-brand-body/55">
                        p. {citation.page_number}
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 border-l border-[#D4B483]/40 pl-2.5 text-[12.5px] italic leading-relaxed text-brand-body/85">
                    &ldquo;{citation.exact_quote}&rdquo;
                  </p>
                  {citation.note && (
                    <p className="mt-1.5 text-[10.5px] text-brand-body/55">{citation.note}</p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-[#8D9D95]/30 bg-[#1A1515]/50 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-verified">
            2 · where accounts agree
          </p>
          <textarea
            value={form.what_agrees}
            onChange={(event) => update("what_agrees", event.target.value)}
            placeholder="What do both records say the same way?"
            className={`${inputClass} mt-2 min-h-[110px] resize-y text-[12.5px]`}
          />
        </div>
        <div className="rounded-xl border border-[#E6C2BF]/35 bg-[#7A4E4A]/18 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-glint">
            Where accounts contradict
          </p>
          <textarea
            value={form.what_contradicts}
            onChange={(event) => update("what_contradicts", event.target.value)}
            placeholder="State the difference without deciding which version is correct."
            className={`${inputClass} mt-2 min-h-[110px] resize-y text-[12.5px]`}
          />
        </div>
      </section>

      <section className="glass-frosted rounded-xl p-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-[#D4B483]" strokeWidth={1.5} />
          <p className="eyebrow">3 · missing records that could resolve this</p>
        </div>
        <textarea
          value={form.missing_records_needed}
          onChange={(event) => update("missing_records_needed", event.target.value)}
          placeholder="Provider attendance logs, scheduling notices, docket entries…"
          className={`${inputClass} mt-2 min-h-[90px] resize-y text-[12.5px]`}
        />
        <button type="button" className={`${ghostButton} mt-2`} onClick={addFollowUpTask}>
          <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
          Create follow-up task
        </button>
      </section>

      <section className="glass-frosted rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-[#D4B483]" strokeWidth={1.5} />
          <p className="eyebrow">{voice.questionsEyebrow}</p>
        </div>
        <label className={`${labelClass} mt-3`}>Alternative explanations to consider</label>
        <textarea
          value={form.alternative_explanations}
          onChange={(event) => update("alternative_explanations", event.target.value)}
          placeholder="What else could explain this besides the explanation you first reached for?"
          className={`${inputClass} min-h-[90px] resize-y text-[12.5px]`}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className={goldButton} onClick={saveAnalysis} disabled={saving}>
            {saving ? "Saving…" : "Save investigation analysis"}
          </button>
          <button
            type="button"
            className={ghostButton}
            onClick={generateQuestions}
            disabled={generating}
          >
            {generating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
            ) : (
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
            {generating ? "Drafting questions…" : voice.questionsButton}
          </button>
        </div>
        <p className="mt-2 text-[10.5px] leading-relaxed text-brand-body/55">
          {voice.questionsNote}
        </p>
      </section>

      <AuditTrail caseId={issue.case_id} entityId={issue.id} title="History of this issue" />

      <p className="px-1 font-mono text-[10px] uppercase tracking-[0.1em] text-brand-body/55">
        Issue opened {formatDate((issue.created_date || "").slice(0, 10))} · {linked.length} tagged
        statements connected
      </p>

      <IssueFormDialog
        open={editing}
        onOpenChange={setEditing}
        onSave={saveIssue}
        initial={issue}
      />
    </div>
  );
}