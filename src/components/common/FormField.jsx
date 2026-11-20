export const inputClass =
  "w-full rounded-lg border border-[#E6C2BF]/25 bg-[#131414]/70 px-3 py-2.5 text-[14px] text-[#F8F0EE] placeholder:text-brand-body/55 focus:border-[#F9EBE5]/70 focus:outline-none focus:ring-2 focus:ring-[#D4B483]/25";

export const labelClass =
  "mb-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-glint/80";

export function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[10.5px] text-brand-body/55">{hint}</span>}
    </label>
  );
}

export const goldButton =
  "btn-foil inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[12.5px] font-semibold disabled:opacity-60";

export const ghostButton =
  "inline-flex items-center justify-center gap-2 rounded-full border border-[#E6C2BF]/35 px-4 py-2 text-[12.5px] text-[#F9EBE5] transition-all duration-300 hover:border-[#F9EBE5]/80 hover:shadow-[0_0_22px_rgba(230,194,191,0.28)]";