import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Pencil, Trash2, Plus, CalendarPlus, Loader2, Fingerprint } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import ParchmentPage from "@/components/shell/ParchmentPage";
import RecordFormDialog from "@/components/evidence/RecordFormDialog";
import CitationForm from "@/components/evidence/CitationForm";
import AuditTrail from "@/components/common/AuditTrail";
import { EpistemicTag, VerificationTag } from "@/components/shell/StatementTags";
import { goldButton, ghostButton } from "@/components/common/FormField";
import { useCase } from "@/components/case/CaseContext";
import { useSourceViewer } from "@/components/shell/SourceViewerContext";
import { formatDate } from "@/lib/domain";
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

export const Route = createFileRoute("/_authed/evidence/$recordId")({
  head: () => ({ meta: [{ title: "Record · WE THE PARENT™" }] }),
  component: RecordDetailPage,
});

function RecordDetailPage() {
  const { recordId } = Route.useParams();
  const navigate = useNavigate();
  const { records, citations, issues, activeCase, loading, reload } = useCase();
  const { openSource } = useSourceViewer();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);

  const record = records.find((item) => item.id === recordId);
  const recordCitations = citations.filter((citation) => citation.record_id === recordId);

  if (!record) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-3 py-10 text-center">
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-brand-body/72">
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
            Loading record…
          </div>
        ) : (
          <>
            <p className="font-heading text-[22px] text-[#F9EBE5]">This record is not in your workspace.</p>
            <Link to="/evidence" className={ghostButton}>
              <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
              Back to evidence library
            </Link>
          </>
        )}
      </div>
    );
  }

  const pages = record.pages?.length ? record.pages : [record.raw_text || ""];
  const currentPage = Math.min(page, pages.length);

  const handleUpdate = async (payload) => {
    await base44.entities.EvidenceRecord.update(record.id, payload);
    await logAudit({
      caseId: record.case_id,
      entityType: "EvidenceRecord",
      entityId: record.id,
      entityLabel: record.title,
      action: "corrected",
      detail: `Record details corrected. Previous title: "${record.title}", previous status: ${record.verification_status}.`,
      previousValue: record.raw_text?.slice(0, 500) || "",
    });
    toast.success("Record updated. The original entry is preserved in the audit log.");
    reload();
  };

  const handleDelete = async () => {
    await base44.entities.EvidenceRecord.delete(record.id);
    await logAudit({
      caseId: record.case_id,
      entityType: "EvidenceRecord",
      entityId: record.id,
      entityLabel: record.title,
      action: "deleted",
      detail: `Record "${record.title}" removed from the library.`,
    });
    toast.success("Record removed.");
    reload();
    navigate({ to: "/evidence" });
  };

  const addToTimeline = async () => {
    await base44.entities.TimelineEvent.create({
      case_id: record.case_id,
      title: record.title,
      event_date: record.event_date || record.documented_date,
      documented_date: record.documented_date || record.event_date,
      description: `Created from the record "${record.title}".`,
      discrepancy_flag: record.verification_status === "discrepancy",
      linked_record_ids: [record.id],
    });
    await logAudit({
      caseId: record.case_id,
      entityType: "TimelineEvent",
      entityId: record.id,
      entityLabel: record.title,
      action: "created",
      detail: `Timeline entry created from "${record.title}".`,
    });
    toast.success("Added to your timeline.");
    reload();
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 pb-6">
      <Link to="/evidence" className="inline-flex items-center gap-1.5 text-[12px] text-brand-glint hover:text-[#F9EBE5]">
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Evidence library
      </Link>

      <PageHeader
        eyebrow={record.category}
        title={record.title}
        description={`${record.source_author || "Author not recorded"} · event ${formatDate(
          record.event_date
        )} · written ${formatDate(record.documented_date)}`}
        actions={
          <>
            <button type="button" className={ghostButton} onClick={addToTimeline}>
              <CalendarPlus className="h-3.5 w-3.5" strokeWidth={1.5} />
              Add to timeline
            </button>
            <button type="button" className={ghostButton} onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
              Edit
            </button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button type="button" className={ghostButton} aria-label="Remove record">
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-[#E6C2BF]/30 bg-[#1A1515] text-[#F8F0EE]">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-heading text-[22px]">Remove this record?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[12.5px] text-brand-body/72">
                    Tagged statements attached to it stay in the audit history. A removal is logged and
                    cannot be undone from the app.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-[#E6C2BF]/30 bg-transparent text-[#F9EBE5] hover:bg-[#3A2C29]/60">
                    Keep record
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="btn-foil text-[#131414]">
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        }
        badge={<VerificationTag status={record.verification_status} />}
      />

      <section className="glass-frosted rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Fingerprint className="h-4 w-4 text-brand-gold" strokeWidth={1.5} />
          <p className="eyebrow">Original file · preservation record</p>
        </div>
        {record.file_url ? (
          <>
            <dl className="mt-2 grid gap-2 sm:grid-cols-3">
              <div className="min-w-0">
                <dt className="text-[9.5px] uppercase tracking-[0.14em] text-brand-body/55">File</dt>
                <dd className="mt-0.5 truncate text-[12px] text-brand-body/92">
                  {record.original_filename || "Name not recorded"}
                </dd>
              </div>
              <div>
                <dt className="text-[9.5px] uppercase tracking-[0.14em] text-brand-body/55">Size</dt>
                <dd className="mt-0.5 text-[12px] text-brand-body/92">
                  {record.file_size_bytes
                    ? `${Math.max(1, Math.round(record.file_size_bytes / 1024))} KB`
                    : "Not recorded"}
                </dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[9.5px] uppercase tracking-[0.14em] text-brand-body/55">
                  SHA-256 fingerprint
                </dt>
                <dd className="mt-0.5 break-all font-mono text-[10.5px] text-brand-verified">
                  {record.checksum_sha256 || "Not recorded"}
                </dd>
              </div>
            </dl>
            <p className="mt-2 text-[10.5px] leading-relaxed text-brand-body/55">
              The original is stored unchanged; the text below is a separate extracted copy. The
              fingerprint shows this file is the one preserved, not that its contents are true.
            </p>
          </>
        ) : (
          <p className="mt-2 text-[11.5px] leading-relaxed text-brand-body/55">
            No original file is attached. The text below is a typed or extracted copy, so treat it as
            a derivative rather than a preserved original.
          </p>
        )}
      </section>

      <div className="glass-frosted rounded-xl p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[11px] text-brand-body/72">
            Page {currentPage} of {pages.length}
          </span>
          <div className="flex gap-1.5">
            {pages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPage(index + 1)}
                className={`flex h-7 w-7 items-center justify-center rounded-md border font-mono text-[11px] ${
                  currentPage === index + 1
                    ? "border-[#F9EBE5]/70 bg-[#D4B483] text-[#131414]"
                    : "border-[#E6C2BF]/25 text-brand-glint"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2">
          <ParchmentPage
            text={pages[currentPage - 1]}
            quotes={recordCitations
              .filter((citation) => Number(citation.page_number) === currentPage)
              .map((citation) => citation.exact_quote)}
          />
        </div>
      </div>

      <section className="glass-frosted rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="eyebrow">Tagged statements</p>
            <p className="mt-1 text-[12px] text-brand-body/72">
              Quotes are verified against the record before they are saved.
            </p>
          </div>
          <button type="button" className={goldButton} onClick={() => setAdding((value) => !value)}>
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Tag a statement
          </button>
        </div>

        {adding && (
          <div className="mt-3">
            <CitationForm
              record={record}
              issues={issues}
              defaultPage={currentPage}
              onSaved={() => {
                setAdding(false);
                reload();
              }}
              onCancel={() => setAdding(false)}
            />
          </div>
        )}

        <div className="mt-3 space-y-2">
          {recordCitations.length === 0 && !adding && (
            <p className="rounded-lg border border-dashed border-[#E6C2BF]/22 p-4 text-[12px] leading-relaxed text-brand-body/55">
              No statements tagged yet. Tagging a sentence lets the assistant cite it, and keeps the
              allegation/observation distinction visible.
            </p>
          )}
          {recordCitations.map((citation) => {
            const issue = issues.find((item) => item.id === citation.linked_issue_id);
            return (
              <div key={citation.id} className="rounded-lg border border-[#E6C2BF]/18 bg-[#131414]/40 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <EpistemicTag type={citation.epistemic_type} />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPage(Number(citation.page_number) || 1);
                        openSource(record, {
                          page: Number(citation.page_number) || 1,
                          quote: citation.exact_quote,
                        });
                      }}
                      className="font-mono text-[10px] text-brand-glint hover:text-[#F9EBE5]"
                    >
                      p. {citation.page_number} · view
                    </button>
                    <button
                      type="button"
                      aria-label="Remove statement"
                      onClick={async () => {
                        await base44.entities.StatementCitation.delete(citation.id);
                        await logAudit({
                          caseId: record.case_id,
                          entityType: "StatementCitation",
                          entityId: citation.id,
                          entityLabel: record.title,
                          action: "deleted",
                          detail: `Statement tag removed from page ${citation.page_number}.`,
                          previousValue: citation.exact_quote,
                        });
                        toast.success("Statement tag removed.");
                        reload();
                      }}
                      className="text-brand-body/55 hover:text-brand-glint"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
                <p className="mt-2 border-l border-[#D4B483]/40 pl-2.5 text-[12.5px] italic leading-relaxed text-brand-body/85">
                  &ldquo;{citation.exact_quote}&rdquo;
                </p>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10.5px] text-brand-body/55">
                  {citation.note && <span>{citation.note}</span>}
                  {issue && (
                    <Link
                      to="/issues/$issueId"
                      params={{ issueId: issue.id }}
                      className="text-[#E6C2BF] hover:text-[#F9EBE5]"
                    >
                      {issue.title}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {activeCase && <AuditTrail caseId={activeCase.id} entityId={record.id} title="History of this record" />}

      <RecordFormDialog
        open={editing}
        onOpenChange={setEditing}
        onSave={handleUpdate}
        initial={record}
      />
    </div>
  );
}