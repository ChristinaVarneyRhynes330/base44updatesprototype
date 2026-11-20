export default function PageHeader({ eyebrow, title, description, actions, badge }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow">{eyebrow}</p>
          {badge}
        </div>
        <h1 className="mt-1.5 font-heading text-[26px] leading-[1.15] text-[#F9EBE5] sm:text-[32px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[13px] leading-relaxed text-brand-body/72">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}