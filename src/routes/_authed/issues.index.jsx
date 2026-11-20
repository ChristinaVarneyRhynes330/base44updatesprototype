import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, ArrowRight, Loader2, SearchCheck } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import IssueFormDialog from "@/components/issues/IssueFormDialog";
import { goldButton } from "@/components/common/FormField";
import { useCase } from "@/components/case/CaseContext";
import { ISSUE_STATUS_OPTIONS } from "@/lib/domain";
import { base44 } from "@/api/base44Client";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/_authed/issues/")({
  head: () => ({ meta: [{ title: "Issues · WE THE PARENT™" }] }),
  component: IssuesPage,
});

const STATUS_STYLES = {
  Open: "border-brand-gold/50 bg-brand-gold/14 text-brand-cream",
  "Needs Records": "border-brand-rose/60 bg-brand-rose/20 text-brand-glint",
  "Ready for Counsel": "border-brand-glint/60 bg-brand-glint/16 text-brand-heading",
  Resolved: "border-brand-pathway/55 bg-brand-pathway/20 text-brand-body",
};

function IssuesPage() {
  const { activeCase, issues, citations, loading, reload } = useCase();
  const [open, setOpen] = useState(false);

  const save = async (payload) => {
    if (!activeCase) return;
    const created = await base44.entities.InvestigativeIssue.create({
      ...payload,
      case_id: activeCase.id,
      linked_citation_ids: [],
    });
    await logAudit({
      caseId: activeCase.id,
      entityType: "InvestigativeIssue",
      entityId: created.id,
      entityLabel: created.title,
      action: "created",
      detail: `Issue opened: "${created.title}" with status ${created.status}.`,
    });
    toast.success("Issue opened. Nothing has been concluded.");
    reload();
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <PageHeader
        eyebrow="Issue Investigator · disputes & missing information"
        title="Hold the difference open, carefully."
        description="Each issue keeps what every source says, where the accounts agree, what is missing, and the questions worth asking."
        actions={
          <button type="button" className={goldButton} onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Open an issue
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-brand-body/72">
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
          <span className="text-[13px]">Loading your issues…</span>
        </div>
      ) : issues.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E6C2BF]/25 p-8 text-center">
          <SearchCheck className="mx-auto h-6 w-6 text-brand-glint" strokeWidth={1.5} />
          <p className="mt-2 font-heading text-[20px] text-[#F9EBE5]">No open investigations.</p>
          <p className="mx-auto mt-1.5 max-w-md text-[12.5px] leading-relaxed text-brand-body/72">
            When two records describe the same event differently, open an issue and connect both
            statements. The investigator keeps the comparison organized without deciding the answer.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {issues.map((issue) => {
            const linked = citations.filter((citation) => citation.linked_issue_id === issue.id);
            return (
              <Link
                key={issue.id}
                to="/issues/$issueId"
                params={{ issueId: issue.id }}
                className="glass-frosted reactive-card flex flex-col rounded-xl p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[9.5px] uppercase tracking-[0.12em] ${
                      STATUS_STYLES[issue.status] || STATUS_STYLES.Open
                    }`}
                  >
                    {issue.status}
                  </span>
                  <span className="font-mono text-[10px] text-brand-body/55">
                    {linked.length} {linked.length === 1 ? "statement" : "statements"}
                  </span>
                </div>
                <h3 className="mt-2 font-heading text-[20px] leading-snug text-[#F9EBE5]">
                  {issue.title}
                </h3>
                <p className="mt-1.5 line-clamp-3 text-[12.5px] leading-relaxed text-brand-body/62">
                  {issue.summary || "No summary yet."}
                </p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[11.5px] text-[#E6C2BF]">
                  Open investigation
                  <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <p className="px-1 text-[10.5px] uppercase tracking-[0.1em] text-brand-body/55">
        Statuses: {ISSUE_STATUS_OPTIONS.join(" · ")}
      </p>

      <IssueFormDialog open={open} onOpenChange={setOpen} onSave={save} />
    </div>
  );
}