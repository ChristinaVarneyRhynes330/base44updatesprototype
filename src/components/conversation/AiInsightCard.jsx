import { Link } from "@tanstack/react-router";
import { ArrowRight, Info, Sparkles } from "lucide-react";
import CitationPill from "./CitationPill";

const ACTION_ROUTES = {
  timeline: "/timeline",
  issue: "/issues",
  evidence: "/evidence",
  draft: "/drafts",
};

export default function AiInsightCard({ result, records, onCite }) {
  const paragraphs = (result.answer || "").split(/\n{2,}/).filter(Boolean);
  const route = result.suggested_action?.kind
    ? ACTION_ROUTES[result.suggested_action.kind]
    : null;

  return (
    <div className="glass-tinted rounded-xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#F9EBE5]" strokeWidth={1.5} />
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#F9EBE5]">
            Case assistant
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="rounded-full border border-brand-gold/50 bg-brand-gold/15 px-2 py-0.5 text-[9.5px] uppercase tracking-[0.14em] text-brand-cream">
            AI suggestion
          </span>
          <span className="rounded-full border border-[#F9EBE5]/40 bg-[#131414]/25 px-2 py-0.5 text-[9.5px] uppercase tracking-[0.14em] text-brand-body">
            Source-grounded
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        {paragraphs.map((paragraph, index) => (
          <p key={index} className="text-[13.5px] leading-[1.7] text-[#F8F0EE]">
            {paragraph}
          </p>
        ))}
      </div>

      {result.verified_facts?.length > 0 && (
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-lg border border-[#8D9D95]/35 bg-[#131414]/30 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-verified">
              What the records show
            </p>
            <ul className="mt-1.5 space-y-1.5">
              {result.verified_facts.map((fact, index) => (
                <li key={index} className="flex gap-1.5 text-[12px] leading-relaxed text-brand-body/85">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#8D9D95]" />
                  {fact}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-[#E6C2BF]/35 bg-[#131414]/30 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-glint">
              Unverified or missing
            </p>
            <ul className="mt-1.5 space-y-1.5">
              {(result.unverified_or_missing?.length
                ? result.unverified_or_missing
                : ["No gaps were identified in the records provided."]
              ).map((item, index) => (
                <li key={index} className="flex gap-1.5 text-[12px] leading-relaxed text-brand-body/85">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[#E6C2BF]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {result.uncertainty && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#E6C2BF]/25 bg-[#131414]/25 p-2.5">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D4B483]" strokeWidth={1.5} />
          <p className="text-[11.5px] leading-relaxed text-brand-glint/85">{result.uncertainty}</p>
        </div>
      )}

      {result.citations?.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-glint">
            Citations
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {result.citations.map((citation, index) => {
              const record = records.find((item) => item.id === citation.record_id);
              return (
                <CitationPill
                  key={`${citation.record_id}-${index}`}
                  index={index + 1}
                  citation={citation}
                  onClick={() => record && onCite(record, citation)}
                />
              );
            })}
          </div>
        </div>
      )}

      {result.citation_limitations > 0 && (
        <p className="mt-2 text-[10.5px] leading-relaxed text-brand-glint/80">
          {result.citation_limitations} suggested quotation
          {result.citation_limitations === 1 ? "" : "s"} could not be matched to a page in your
          records, so {result.citation_limitations === 1 ? "it was" : "they were"} withheld rather
          than shown as a citation.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#F9EBE5]/15 pt-3">
        <p className="text-[10.5px] uppercase tracking-[0.12em] text-brand-glint/80">
          The AI assists · the evidence informs · you decide
        </p>
        {route && result.suggested_action?.label && (
          <Link
            to={route}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#F9EBE5]/45 px-3 py-1.5 text-[11.5px] text-[#F9EBE5] transition-all duration-300 hover:bg-[#F9EBE5]/10 hover:shadow-[0_0_22px_rgba(230,194,191,0.3)]"
          >
            {result.suggested_action.label}
            <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
          </Link>
        )}
      </div>
    </div>
  );
}