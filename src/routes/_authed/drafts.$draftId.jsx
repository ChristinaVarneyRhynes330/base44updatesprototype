import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy, Printer, Trash2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import { DraftStamp } from "@/components/shell/StatementTags";
import { goldButton, ghostButton, inputClass } from "@/components/common/FormField";
import { useCase } from "@/components/case/CaseContext";
import { useSourceViewer } from "@/components/shell/SourceViewerContext";
import { base44 } from "@/api/base44Client";
import { logAudit } from "@/lib/audit";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authed/drafts/$draftId")({
  head: () => ({ meta: [{ title: "Draft · WE THE PARENT™" }] }),
  component: DraftDetailPage,
});

function DraftDetailPage() {
  const { draftId } = Route.useParams();
  const navigate = useNavigate();
  const { drafts, citations, records, loading, reload } = useCase();
  const { openSource } = useSourceViewer();
  const draft = drafts.find((item) => item.id === draftId);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (draft) {
      setTitle(draft.title || "");
      setContent(draft.content || "");
    }
  }, [draft?.id, draft?.updated_date]);

  if (!draft) {
    return (
      <div className="mx-auto max-w-2xl space-y-3 py-10 text-center">
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-brand-body/72">
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
            Opening draft…
          </div>
        ) : (
          <>
            <p className="font-heading text-[22px] text-[#F9EBE5]">This draft is no longer available.</p>
            <Link to="/drafts" className={ghostButton}>
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
              Back to drafts
            </Link>
          </>
        )}
      </div>
    );
  }

  const linked = citations.filter((citation) =>
    (draft.linked_citation_ids || []).includes(citation.id)
  );

  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.DraftDocument.update(draft.id, {
        title: title.trim() || draft.title,
        content,
        status: "DRAFT - NOT FILED",
      });
      await logAudit({
        caseId: draft.case_id,
        entityType: "DraftDocument",
        entityId: draft.id,
        entityLabel: title,
        action: "updated",
        detail: "Draft content updated. Status remains DRAFT - NOT FILED.",
        previousValue: draft.content?.slice(0, 400) || "",
      });
      toast.success("Draft saved. It is still a draft.");
      reload();
    } finally {
      setSaving(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(`${title}\n\n${content}`);
    toast.success("Copied with the draft stamp intact.");
  };

  const remove = async () => {
    await base44.entities.DraftDocument.delete(draft.id);
    await logAudit({
      caseId: draft.case_id,
      entityType: "DraftDocument",
      entityId: draft.id,
      entityLabel: draft.title,
      action: "deleted",
      detail: "Draft removed from the workspace.",
    });
    toast.success("Draft removed.");
    reload();
    navigate({ to: "/drafts" });
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 pb-10">
      <Link to="/drafts" className="inline-flex items-center gap-1.5 text-[12px] text-brand-glint hover:text-[#F9EBE5]">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        All drafts
      </Link>

      <PageHeader
        eyebrow={`${draft.draft_type} · draft workspace`}
        title={draft.title}
        description="Preparing something and legally accomplishing it are not the same thing. This document has not been filed or served."
        badge={<DraftStamp />}
        actions={
          <>
            <button type="button" className={ghostButton} onClick={copy}>
              <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
              Copy
            </button>
            <button type="button" className={ghostButton} onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" strokeWidth={1.5} />
              Print
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button type="button" className={ghostButton} aria-label="Delete draft">
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-[#E6C2BF]/30 bg-[#1A1515] text-[#F8F0EE]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-heading text-[22px]">Delete this draft?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[12.5px] text-brand-body/72">
                    This cannot be undone. The deletion is recorded in the audit log.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-[#E6C2BF]/30 bg-transparent text-[#F9EBE5] hover:bg-[#3A2C29]/60">
                    Keep draft
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={remove} className="btn-foil text-[#131414]">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E6C2BF]/45 bg-[#7A4E4A]/20 px-3 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F9EBE5]">
          Draft only — not filed or served
        </span>
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.1em] text-brand-glint/80">
          <ShieldCheck className="h-3 w-3" strokeWidth={1.5} />
          Status cannot be changed to filed from this app
        </span>
      </div>

      <div className="glass-frosted rounded-xl p-4">
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-glint/80">
          Title
        </label>
        <input className={inputClass} value={title} onChange={(event) => setTitle(event.target.value)} />
        <label className="mb-1 mt-3 block text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-glint/80">
          Draft content
        </label>
        <textarea
          className={`${inputClass} min-h-[340px] resize-y font-mono text-[12.5px] leading-[1.8]`}
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10.5px] text-brand-body/55">
            Citations appear as [Record · page]. Edit freely; the stamp is restored on save.
          </p>
          <button type="button" className={goldButton} onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save draft"}
          </button>
        </div>
      </div>

      {linked.length > 0 && (
        <div className="glass-frosted rounded-xl p-4">
          <p className="eyebrow">Sources attached to this draft</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
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
                  className="rounded-full border border-[#E6C2BF]/25 px-2.5 py-1 text-[10.5px] text-brand-glint/85 transition-all duration-300 hover:border-[#F9EBE5]/70 hover:text-[#F9EBE5]"
                >
                  {record?.title || "Record"} · p. {citation.page_number}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}