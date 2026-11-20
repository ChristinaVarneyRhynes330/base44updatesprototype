import { EPISTEMIC_STYLES, VERIFICATION_STYLES } from "@/lib/domain";

export function EpistemicTag({ type, className = "" }) {
  if (!type) return null;
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full border px-2 py-[3px] text-[10px] uppercase tracking-[0.12em] ${
        EPISTEMIC_STYLES[type] || EPISTEMIC_STYLES.Inference
      } ${className}`}
    >
      {type}
    </span>
  );
}

export function VerificationTag({ status }) {
  const style = VERIFICATION_STYLES[status] || VERIFICATION_STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] ${style.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

export function DraftStamp({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-brand-preservation/60 bg-brand-preservation/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-cream ${className}`}
    >
      Draft only — not filed or served
    </span>
  );
}