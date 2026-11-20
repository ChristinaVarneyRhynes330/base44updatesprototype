import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { asItems } from "@/lib/queryHelpers";
import { formatDate } from "@/lib/domain";

const ACTION_LABEL = {
  created: "Created",
  updated: "Updated",
  corrected: "Corrected",
  flagged: "Flagged",
  deleted: "Removed",
};

export default function AuditTrail({ caseId, entityId, limit = 20, title = "Correction & audit log" }) {
  const [entries, setEntries] = useState(null);

  useEffect(() => {
    let alive = true;
    const query = entityId ? { entity_id: entityId } : { case_id: caseId };
    if (!caseId && !entityId) return;
    base44.entities.AuditLog.filter(query, { sort: "-created_date", limit })
      .then((result) => alive && setEntries(asItems(result)))
      .catch(() => alive && setEntries([]));
    return () => {
      alive = false;
    };
  }, [caseId, entityId, limit]);

  return (
    <div className="rounded-xl border border-[#E6C2BF]/20 bg-[#1A1515]/45 p-4">
      <div className="flex items-center gap-2">
        <History className="h-3.5 w-3.5 text-[#D4B483]" strokeWidth={1.5} />
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-glint/80">{title}</p>
      </div>
      {entries === null && <p className="mt-2 text-[12px] text-brand-body/55">Loading history…</p>}
      {entries?.length === 0 && (
        <p className="mt-2 text-[12px] leading-relaxed text-brand-body/55">
          No changes recorded yet. Every correction is preserved here rather than overwriting the
          original entry.
        </p>
      )}
      <ul className="mt-3 space-y-2.5">
        {entries?.map((entry) => (
          <li key={entry.id} className="border-l border-[#D4B483]/30 pl-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#E6C2BF]/30 px-2 py-0.5 text-[9.5px] uppercase tracking-[0.12em] text-[#E6C2BF]">
                {ACTION_LABEL[entry.action] || entry.action}
              </span>
              <span className="font-mono text-[10px] text-brand-body/55">
                {formatDate((entry.created_date || "").slice(0, 10))}
              </span>
            </div>
            <p className="mt-1 text-[12px] leading-relaxed text-brand-glint/85">{entry.detail}</p>
            {entry.entity_label && (
              <p className="mt-0.5 text-[10.5px] text-brand-body/55">{entry.entity_label}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}