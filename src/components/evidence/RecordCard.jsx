import { Link } from "@tanstack/react-router";
import { FileText, ArrowUpRight } from "lucide-react";
import { VerificationTag } from "@/components/shell/StatementTags";
import { formatDate } from "@/lib/domain";

export default function RecordCard({ record, citationCount = 0, onOpen }) {
  return (
    <div className="glass-frosted reactive-card flex flex-col rounded-xl p-4">
      <button type="button" onClick={() => onOpen(record)} className="flex-1 text-left">
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full border border-[#E6C2BF]/30 bg-[#131414]/40 px-2 py-0.5 text-[9.5px] uppercase tracking-[0.12em] text-[#E6C2BF]">
            {record.category}
          </span>
          <FileText className="h-4 w-4 shrink-0 text-brand-glint" strokeWidth={1.5} />
        </div>
        <h3 className="mt-2 font-heading text-[19px] leading-snug text-[#F9EBE5]">{record.title}</h3>
        <p className="mt-0.5 truncate text-[11.5px] text-brand-body/72">
          {record.source_author || "Author not recorded"}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#E6C2BF]/12 pt-2.5">
          <div>
            <p className="text-[9px] uppercase tracking-[0.12em] text-brand-body/55">Event</p>
            <p className="font-mono text-[11px] text-brand-glint/85">{formatDate(record.event_date)}</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.12em] text-brand-body/55">Written</p>
            <p className="font-mono text-[11px] text-brand-glint/85">{formatDate(record.documented_date)}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <VerificationTag status={record.verification_status} />
          <span className="font-mono text-[10px] text-brand-body/55">
            {citationCount} {citationCount === 1 ? "statement" : "statements"}
          </span>
        </div>
      </button>
      <Link
        to="/evidence/$recordId"
        params={{ recordId: record.id }}
        className="mt-3 inline-flex items-center gap-1 text-[11.5px] text-[#E6C2BF] transition-colors hover:text-[#F9EBE5]"
      >
        Open full record
        <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
      </Link>
    </div>
  );
}