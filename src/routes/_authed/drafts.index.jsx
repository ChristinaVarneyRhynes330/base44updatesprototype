import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Loader2, PenLine, ArrowRight } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import DraftCreateDialog from "@/components/drafts/DraftCreateDialog";
import { goldButton } from "@/components/common/FormField";
import { DraftStamp } from "@/components/shell/StatementTags";
import { useCase } from "@/components/case/CaseContext";
import { getVoice } from "@/lib/representation";
import { formatDate } from "@/lib/domain";

export const Route = createFileRoute("/_authed/drafts/")({
  head: () => ({ meta: [{ title: "Drafts · WE THE PARENT™" }] }),
  validateSearch: (search) => ({
    openForm: search.new === 1 || search.new === "1" || search.new === true,
  }),
  component: DraftsPage,
});

function DraftsPage() {
  const { activeCase, drafts, issues, loading, reload } = useCase();
  const voice = getVoice(activeCase);
  const { openForm } = Route.useSearch();
  const [dialogOpen, setDialogOpen] = useState(Boolean(openForm));

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <PageHeader
        eyebrow="Drafts & Preparation · source-linked working drafts"
        title="A draft stays a draft."
        description={voice.draftsDescription}
        actions={
          <button type="button" className={goldButton} onClick={() => setDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            New draft
          </button>
        }
        badge={<DraftStamp />}
      />

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-brand-body/72">
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
          <span className="text-[13px]">Opening your drafts…</span>
        </div>
      ) : drafts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E6C2BF]/25 p-8 text-center">
          <PenLine className="mx-auto h-6 w-6 text-brand-glint" strokeWidth={1.5} />
          <p className="mt-2 font-heading text-[20px] text-[#F9EBE5]">No drafts yet.</p>
          <p className="mx-auto mt-1.5 max-w-md text-[12.5px] leading-relaxed text-brand-body/72">
            {voice.draftsEmpty}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {drafts.map((draft) => (
            <Link
              key={draft.id}
              to="/drafts/$draftId"
              params={{ draftId: draft.id }}
              className="glass-frosted reactive-card flex flex-col rounded-xl p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full border border-[#E6C2BF]/30 px-2 py-0.5 text-[9.5px] uppercase tracking-[0.12em] text-[#E6C2BF]">
                  {draft.draft_type}
                </span>
                <span className="font-mono text-[10px] text-brand-body/55">
                  {formatDate((draft.updated_date || draft.created_date || "").slice(0, 10))}
                </span>
              </div>
              <h3 className="mt-2 font-heading text-[19px] leading-snug text-[#F9EBE5]">
                {draft.title}
              </h3>
              <p className="mt-1.5 line-clamp-3 whitespace-pre-wrap text-[12px] leading-relaxed text-brand-body/62">
                {(draft.content || "").replace("DRAFT — NOT FILED OR SERVED", "").trim()}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#E6C2BF]/12 pt-2.5">
                <span className="text-[10px] uppercase tracking-[0.12em] text-[#E6C2BF]">
                  {draft.status || "DRAFT - NOT FILED"}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-brand-glint">
                  Open
                  <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-[#E6C2BF]/20 bg-[#1A1515]/45 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#D4B483]">
          The four-step workflow
        </p>
        <div className="mt-2 grid gap-2 text-[12px] text-brand-body/62 sm:grid-cols-4">
          {["Identify the issue", "Gather the sources", "Consider the rules", "Prepare the questions"].map(
            (step, index) => (
              <div key={step} className="rounded-lg border border-[#E6C2BF]/15 px-2.5 py-2">
                <span className="font-mono text-[10px] text-brand-body/55">0{index + 1}</span>
                <p className="mt-0.5 leading-snug">{step}</p>
              </div>
            )
          )}
        </div>
      </div>

      {activeCase && (
        <DraftCreateDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          caseId={activeCase.id}
          representation={activeCase.representation}
          issues={issues}
          onCreated={reload}
        />
      )}
    </div>
  );
}