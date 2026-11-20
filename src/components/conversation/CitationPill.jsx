import { ChevronRight } from "lucide-react";

export default function CitationPill({ index, citation, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-2 rounded-full border border-[#F9EBE5]/30 bg-[#1A1515]/45 py-1 pl-1 pr-2.5 text-[11.5px] text-brand-body transition-all duration-300 hover:border-[#F9EBE5]/80 hover:shadow-[0_0_20px_rgba(230,194,191,0.32)]"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D4B483] font-mono text-[10px] font-semibold text-[#131414]">
        {index}
      </span>
      <span className="max-w-[190px] truncate">
        {citation.record_title} · p. {citation.page_number}
      </span>
      <ChevronRight className="h-3 w-3 text-brand-glint transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.5} />
    </button>
  );
}