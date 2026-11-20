import { Link } from "@tanstack/react-router";
import { X, ArrowRight, CalendarPlus, Flag } from "lucide-react";
import ParchmentPage from "./ParchmentPage";
import { EpistemicTag, VerificationTag } from "./StatementTags";
import { formatDate } from "@/lib/domain";
import { cn } from "@/lib/utils";

export default function RightPane({
  source,
  record,
  citations = [],
  onClose,
  onAddToTimeline,
  onFlagDiscrepancy,
  className = "",
}) {
  const activeRecord = source?.record || record;
  if (!activeRecord) return null;

  const pages = activeRecord.pages?.length ? activeRecord.pages : [activeRecord.raw_text || ""];
  const page = Math.min(Math.max(source?.page || 1, 1), pages.length);
  const pageText = pages[page - 1] || "";
  const recordCitations = citations.filter((citation) => citation.record_id === activeRecord.id);
  const pageCitations = recordCitations.filter((citation) => Number(citation.page_number) === page);
  const quotes = pageCitations.map((citation) => citation.exact_quote);
  if (source?.quote && !quotes.includes(source.quote)) quotes.push(source.quote);

  return (
    <aside
      className={cn(
        "flex min-h-0 flex-col border-[#E6C2BF]/20 bg-[#3A2C29]/62 backdrop-blur-2xl xl:border-l",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2 border-b border-[#E6C2BF]/15 px-4 py-3">
        <div className="min-w-0">
          <p className="eyebrow">Source viewer</p>
          <h3 className="mt-1 truncate font-heading text-[17px] font-medium text-[#F9EBE5]">
            {activeRecord.title}
          </h3>
          <p className="mt-0.5 truncate text-[11px] text-brand-body/72">
            {activeRecord.category} · {activeRecord.source_author || "Author not recorded"}
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close source viewer"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#E6C2BF]/25 text-brand-glint xl:hidden"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 px-4 py-2.5">
        <span className="font-mono text-[11px] text-brand-body/72">
          Page {page} of {pages.length}
        </span>
        <div className="flex items-center gap-1.5">
          {pages.map((_, index) => (
            <span
              key={index}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md border font-mono text-[11px]",
                page === index + 1
                  ? "border-[#F9EBE5]/70 bg-[#D4B483] text-[#131414] shadow-[0_0_14px_rgba(212,180,131,0.45)]"
                  : "border-[#E6C2BF]/25 text-brand-glint"
              )}
            >
              {index + 1}
            </span>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
        <ParchmentPage text={pageText} quotes={quotes} />

        {activeRecord.verification_status === "discrepancy" && (
          <div className="mt-3 rounded-xl border border-[#E6C2BF]/45 bg-[#7A4E4A]/30 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-glint">
              Discrepancy notice
            </p>
            <p className="mt-1.5 text-[12px] leading-relaxed text-brand-body/92">
              This record&rsquo;s account differs from another record in this case. Compare both
              before drawing a conclusion.
            </p>
          </div>
        )}

        {pageCitations.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="eyebrow">Tagged statements on this page</p>
            {pageCitations.map((citation) => (
              <div
                key={citation.id}
                className="rounded-xl border border-[#E6C2BF]/18 bg-[#1A1515]/50 p-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <EpistemicTag type={citation.epistemic_type} />
                  <span className="font-mono text-[10px] text-brand-body/55">
                    p. {citation.page_number}
                  </span>
                </div>
                <p className="mt-1.5 border-l border-[#D4B483]/40 pl-2 text-[12px] italic leading-relaxed text-brand-body/80">
                  &ldquo;{citation.exact_quote}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2 border-t border-[#E6C2BF]/15 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-brand-body/55">
            Event {formatDate(activeRecord.event_date)} · written{" "}
            {formatDate(activeRecord.documented_date)}
          </span>
          <VerificationTag status={activeRecord.verification_status} />
        </div>
        <Link
          to="/evidence/$recordId"
          params={{ recordId: activeRecord.id }}
          className="flex items-center justify-between rounded-full border border-[#E6C2BF]/40 px-4 py-2.5 text-[13px] text-[#F9EBE5] transition-all duration-300 hover:border-[#F9EBE5]/85 hover:shadow-[0_0_24px_rgba(230,194,191,0.32)]"
        >
          Open full record
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onAddToTimeline?.(activeRecord)}
            className="flex items-center justify-center gap-1.5 rounded-full border border-[#E6C2BF]/25 px-3 py-2 text-[11.5px] text-brand-glint/85 transition-all duration-300 hover:border-[#F9EBE5]/70 hover:text-[#F9EBE5]"
          >
            <CalendarPlus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Add to timeline
          </button>
          <button
            type="button"
            onClick={() => onFlagDiscrepancy?.(activeRecord)}
            className="flex items-center justify-center gap-1.5 rounded-full border border-[#E6C2BF]/25 px-3 py-2 text-[11.5px] text-brand-glint/85 transition-all duration-300 hover:border-[#F9EBE5]/70 hover:text-[#F9EBE5]"
          >
            <Flag className="h-3.5 w-3.5" strokeWidth={1.5} />
            Flag discrepancy
          </button>
        </div>
      </div>
    </aside>
  );
}