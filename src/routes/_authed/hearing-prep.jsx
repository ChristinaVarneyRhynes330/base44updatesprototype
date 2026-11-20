import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Gavel, ShieldAlert, ArrowRight, Loader2, Play } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import { goldButton, ghostButton, inputClass } from "@/components/common/FormField";
import { DraftStamp } from "@/components/shell/StatementTags";
import { useCase } from "@/components/case/CaseContext";
import { getVoice } from "@/lib/representation";
import { formatLongDate } from "@/lib/domain";
import { base44 } from "@/api/base44Client";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/_authed/hearing-prep")({
  head: () => ({ meta: [{ title: "Hearing Preparation · WE THE PARENT™" }] }),
  component: HearingPrepPage,
});

function HearingPrepPage() {
  const navigate = useNavigate();
  const { activeCase, issues, records, citations, hearingNotes, drafts, reload } = useCase();
  const [hearingTitle, setHearingTitle] = useState("Review hearing");
  const [hearingDate, setHearingDate] = useState("");
  const [goals, setGoals] = useState("");
  const [questions, setQuestions] = useState("");
  const [selectedIssues, setSelectedIssues] = useState(null);
  const [saving, setSaving] = useState(false);

  const issueSelection = selectedIssues ?? issues.map((issue) => issue.id);

  const toggleIssue = (id) => {
    setSelectedIssues(
      issueSelection.includes(id)
        ? issueSelection.filter((item) => item !== id)
        : [...issueSelection, id]
    );
  };

  const buildPacket = () => {
    const chosenIssues = issues.filter((issue) => issueSelection.includes(issue.id));
    const lines = [
      "DRAFT — NOT FILED OR SERVED",
      "",
      "HEARING PACKET",
      `Case: ${activeCase?.title || ""}${activeCase?.case_number ? ` (${activeCase.case_number})` : ""}`,
      `Hearing: ${hearingTitle || "Hearing"}${hearingDate ? ` — ${formatLongDate(hearingDate)}` : ""}`,
      "",
      "PURPOSE OF THIS HEARING",
      goals.trim() || "Not yet stated. Write one sentence about what you need addressed.",
      "",
      "ISSUES TO ADDRESS",
    ];

    chosenIssues.forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue.title} — ${issue.status}`);
      if (issue.summary) lines.push(`   ${issue.summary}`);
      const issueCitations = citations.filter((citation) => citation.linked_issue_id === issue.id);
      issueCitations.forEach((citation) => {
        const record = records.find((item) => item.id === citation.record_id);
        lines.push(
          `   • "${citation.exact_quote}" [${record?.title || "record"} · p. ${citation.page_number}] (${citation.epistemic_type})`
        );
      });
      lines.push("");
    });

    lines.push("KEY EXHIBITS");
    const exhibitRecords = records.filter((record) =>
      citations.some((citation) => citation.record_id === record.id)
    );
    if (exhibitRecords.length === 0) lines.push("- No cited exhibits yet.");
    exhibitRecords.forEach((record) => {
      lines.push(
        `- ${record.title} (${record.category}) — event ${record.event_date || "unknown"}, written ${
          record.documented_date || "unknown"
        }`
      );
    });

    lines.push("", "PRIORITY QUESTIONS");
    const questionList = questions
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (questionList.length === 0) lines.push("1. Add the questions you need answered.");
    questionList.forEach((question, index) => lines.push(`${index + 1}. ${question}`));

    lines.push(
      "",
      "VERIFICATION REMINDER",
      getVoice(activeCase).packetReminder
    );

    return {
      content: lines.join("\n"),
      citationIds: citations
        .filter((citation) => issueSelection.includes(citation.linked_issue_id))
        .map((citation) => citation.id),
    };
  };

  const savePacket = async (enterCourtroom = false) => {
    if (!activeCase) return;
    setSaving(true);
    try {
      const packet = buildPacket();
      const created = await base44.entities.DraftDocument.create({
        case_id: activeCase.id,
        title: `${hearingTitle || "Hearing"} packet${hearingDate ? ` — ${hearingDate}` : ""}`,
        draft_type: "Hearing Packet",
        content: packet.content,
        status: "DRAFT - NOT FILED",
        linked_citation_ids: packet.citationIds,
      });
      await logAudit({
        caseId: activeCase.id,
        entityType: "DraftDocument",
        entityId: created.id,
        entityLabel: created.title,
        action: "created",
        detail: "Hearing packet assembled from selected issues, exhibits, and priority questions.",
      });
      toast.success("Hearing packet saved as a draft.");
      reload();
      if (enterCourtroom) navigate({ to: "/courtroom" });
    } finally {
      setSaving(false);
    }
  };

  const latestPacket = [...drafts]
    .filter((draft) => draft.draft_type === "Hearing Packet")
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 pb-8">
      <PageHeader
        eyebrow="Hearings & Orders · preparation & packet"
        title="Walk in knowing what you are there to address."
        description="Assemble the issues, the exact citations, and the questions worth asking. The packet stays a draft; the hearing is where it becomes a conversation."
        badge={<DraftStamp />}
        actions={
          <>
            <button type="button" className={ghostButton} onClick={() => savePacket(false)} disabled={saving}>
              Save packet
            </button>
            <button type="button" className={goldButton} onClick={() => savePacket(true)} disabled={saving}>
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
              ) : (
                <Play className="h-3.5 w-3.5" strokeWidth={1.5} />
              )}
              Save &amp; enter courtroom mode
            </button>
          </>
        }
      />

      <div className="flex items-start gap-2 rounded-xl border border-[#E6C2BF]/25 bg-[#1A1515]/50 px-3 py-2.5">
        <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D4B483]" strokeWidth={1.5} />
        <p className="text-[11px] leading-relaxed text-brand-body/62">
          Courtroom mode is a focused workspace, not legal direction. It does not tell you what to say
          and it cannot verify a rule in your jurisdiction during a live hearing.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-frosted space-y-3 rounded-xl p-4">
          <p className="eyebrow">The hearing</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-glint/80">
                Hearing
              </span>
              <input className={inputClass} value={hearingTitle} onChange={(event) => setHearingTitle(event.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-glint/80">
                Date
              </span>
              <input
                type="date"
                className={inputClass}
                value={hearingDate}
                onChange={(event) => setHearingDate(event.target.value)}
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-glint/80">
              What you need addressed
            </span>
            <textarea
              className={`${inputClass} min-h-[70px] resize-y text-[12.5px]`}
              value={goals}
              onChange={(event) => setGoals(event.target.value)}
              placeholder="One sentence: written notice of schedule changes before any visit is marked missed."
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-glint/80">
              Priority questions (one per line)
            </span>
            <textarea
              className={`${inputClass} min-h-[100px] resize-y text-[12.5px]`}
              value={questions}
              onChange={(event) => setQuestions(event.target.value)}
              placeholder={"Was written notice of the May schedule change sent?\nMay 7 visit — was it recorded?"}
            />
          </label>
        </div>

        <div className="glass-frosted rounded-xl p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="eyebrow">Issues in this packet</p>
            <span className="font-mono text-[10px] text-brand-body/55">
              {issueSelection.length} of {issues.length}
            </span>
          </div>
          <div className="mt-2 space-y-2">
            {issues.length === 0 && (
              <p className="text-[12px] leading-relaxed text-brand-body/55">
                No investigative issues yet. A packet built around issues is stronger than a packet
                built around documents.
              </p>
            )}
            {issues.map((issue) => {
              const count = citations.filter((citation) => citation.linked_issue_id === issue.id).length;
              const checked = issueSelection.includes(issue.id);
              return (
                <label
                  key={issue.id}
                  className={`flex cursor-pointer items-start gap-2.5 rounded-lg border p-3 transition-colors ${
                    checked ? "border-[#E6C2BF]/45 bg-[#7A4E4A]/20" : "border-[#E6C2BF]/18 bg-[#131414]/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleIssue(issue.id)}
                    className="mt-0.5 h-4 w-4 accent-[#D4B483]"
                  />
                  <span className="min-w-0">
                    <span className="block text-[12.5px] leading-snug text-brand-body/92">{issue.title}</span>
                    <span className="mt-0.5 block text-[10px] uppercase tracking-[0.1em] text-brand-body/55">
                      {issue.status} · {count} statements
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="glass-frosted rounded-xl p-4">
        <p className="eyebrow">Key exhibits</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {records.map((record) => {
            const count = citations.filter((citation) => citation.record_id === record.id).length;
            return (
              <div
                key={record.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-[#E6C2BF]/15 bg-[#131414]/30 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-[12px] text-brand-body/92">{record.title}</p>
                  <p className="text-[10px] uppercase tracking-[0.1em] text-brand-body/55">
                    {record.category} · {count} cited
                  </p>
                </div>
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    count > 0 ? "bg-brand-gold" : "bg-brand-espresso"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E6C2BF]/20 bg-[#1A1515]/45 p-4">
        <div className="flex items-start gap-3">
          <Gavel className="mt-0.5 h-4 w-4 shrink-0 text-[#D4B483]" strokeWidth={1.5} />
          <div>
            <p className="text-[12px] font-medium text-brand-body/92">After the hearing</p>
            <p className="mt-0.5 max-w-lg text-[11.5px] leading-relaxed text-brand-body/72">
              {hearingNotes.length > 0
                ? `${hearingNotes.length} hearing note${hearingNotes.length === 1 ? "" : "s"} recorded. Compare each with the written order.`
                : "Record what was requested, discussed, and ruled inside courtroom mode, then compare it with the written order."}
            </p>
            {latestPacket && (
              <Link
                to="/drafts/$draftId"
                params={{ draftId: latestPacket.id }}
                className="mt-1 inline-flex items-center gap-1 text-[11px] text-[#E6C2BF] hover:text-[#F9EBE5]"
              >
                Open the most recent packet
                <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
              </Link>
            )}
          </div>
        </div>
        <Link to="/courtroom" className={ghostButton}>
          Enter courtroom mode
        </Link>
      </div>
    </div>
  );
}