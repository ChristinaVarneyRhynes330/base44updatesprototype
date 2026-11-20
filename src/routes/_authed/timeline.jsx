import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, AlertTriangle, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import EventFormDialog from "@/components/timeline/EventFormDialog";
import { goldButton, ghostButton } from "@/components/common/FormField";
import { useCase } from "@/components/case/CaseContext";
import { useSourceViewer } from "@/components/shell/SourceViewerContext";
import { formatDate, formatLongDate } from "@/lib/domain";
import { base44 } from "@/api/base44Client";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/_authed/timeline")({
  head: () => ({ meta: [{ title: "Timeline · WE THE PARENT™" }] }),
  component: TimelinePage,
});

function TimelinePage() {
  const { activeCase, timeline, records, loading, reload } = useCase();
  const { openSource } = useSourceViewer();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [onlyFlags, setOnlyFlags] = useState(false);

  const sorted = useMemo(() => {
    const items = [...timeline].sort((a, b) => {
      const left = new Date(`${a.event_date || "1900-01-01"}T00:00:00`).getTime();
      const right = new Date(`${b.event_date || "1900-01-01"}T00:00:00`).getTime();
      return left - right;
    });
    return onlyFlags ? items.filter((item) => item.discrepancy_flag) : items;
  }, [timeline, onlyFlags]);

  const save = async (payload) => {
    if (!activeCase) return;
    if (editing) {
      await base44.entities.TimelineEvent.update(editing.id, payload);
      await logAudit({
        caseId: activeCase.id,
        entityType: "TimelineEvent",
        entityId: editing.id,
        entityLabel: payload.title,
        action: "corrected",
        detail: `Timeline entry corrected: "${editing.title}" → "${payload.title}".`,
        previousValue: `${editing.event_date} / ${editing.documented_date}`,
      });
      toast.success("Timeline entry updated.");
    } else {
      const created = await base44.entities.TimelineEvent.create({
        ...payload,
        case_id: activeCase.id,
      });
      await logAudit({
        caseId: activeCase.id,
        entityType: "TimelineEvent",
        entityId: created.id,
        entityLabel: created.title,
        action: "created",
        detail: `Timeline entry added for ${created.event_date}.`,
      });
      toast.success("Added to your timeline.");
    }
    setEditing(null);
    reload();
  };

  const remove = async (entry) => {
    await base44.entities.TimelineEvent.delete(entry.id);
    await logAudit({
      caseId: activeCase.id,
      entityType: "TimelineEvent",
      entityId: entry.id,
      entityLabel: entry.title,
      action: "deleted",
      detail: `Timeline entry removed: "${entry.title}".`,
    });
    toast.success("Timeline entry removed.");
    reload();
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 pb-6">
      <PageHeader
        eyebrow="Timeline · dual-date chronology"
        title="Two dates for every event."
        description="The date something happened and the date someone wrote it down are different facts. Keeping them apart is how a record becomes testable."
        actions={
          <>
            <button
              type="button"
              className={onlyFlags ? goldButton : ghostButton}
              onClick={() => setOnlyFlags((value) => !value)}
            >
              <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.5} />
              Conflicts only
            </button>
            <button type="button" className={goldButton} onClick={() => setDialogOpen(true)}>
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Add entry
            </button>
          </>
        }
      />

      <div className="glass-frosted flex flex-wrap items-center gap-4 rounded-xl px-4 py-3 text-[11px] text-brand-body/72">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#D4B483]" />
          Event date — when it happened
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand-preservation" />
          Documented date — when it was recorded
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#E6C2BF]" />
          Records conflict
        </span>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-brand-body/72">
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
          <span className="text-[13px]">Building your chronology…</span>
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E6C2BF]/25 p-8 text-center">
          <p className="font-heading text-[20px] text-[#F9EBE5]">Nothing on the timeline yet.</p>
          <p className="mx-auto mt-1.5 max-w-md text-[12.5px] leading-relaxed text-brand-body/72">
            Add the first entry, or open a record and choose Add to timeline. You can always separate
            the event date from the documented date later.
          </p>
        </div>
      ) : (
        <div className="relative space-y-3 border-l border-[#E6C2BF]/20 pl-4 sm:pl-6">
          {sorted.map((entry) => {
            const linked = (entry.linked_record_ids || [])
              .map((id) => records.find((record) => record.id === id))
              .filter(Boolean);
            return (
              <div key={entry.id} className="relative">
                <span
                  className={`absolute -left-[22px] top-5 h-2.5 w-2.5 rounded-full border sm:-left-[30px] ${
                    entry.discrepancy_flag
                      ? "border-[#F9EBE5] bg-[#E6C2BF] shadow-[0_0_12px_rgba(230,194,191,0.8)]"
                      : "border-[#D4B483]/60 bg-[#131414]"
                  }`}
                />
                <div
                  className={`reactive-card rounded-xl p-4 ${
                    entry.discrepancy_flag
                      ? "border border-[#E6C2BF]/45 bg-[#7A4E4A]/22"
                      : "glass-frosted"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="flex min-w-0 gap-3">
                      <div className="shrink-0 text-center">
                        <p className="font-heading text-[24px] leading-none text-[#F9EBE5]">
                          {(entry.event_date || "").slice(8, 10) || "—"}
                        </p>
                        <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-brand-glint">
                          {(entry.event_date || "").slice(5, 7)
                            ? new Date(`${entry.event_date}T00:00:00`).toLocaleDateString("en-US", { month: "short" })
                            : ""}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-heading text-[18px] leading-snug text-[#F9EBE5]">
                          {entry.title}
                        </h3>
                        {entry.description && (
                          <p className="mt-1 text-[12.5px] leading-relaxed text-brand-body/80">
                            {entry.description}
                          </p>
                        )}
                      </div>
                    </div>
                    {entry.discrepancy_flag && (
                      <span className="flex items-center gap-1 rounded-full border border-[#F9EBE5]/50 bg-[#131414]/30 px-2 py-0.5 text-[9.5px] uppercase tracking-[0.12em] text-[#F9EBE5]">
                        <AlertTriangle className="h-2.5 w-2.5" strokeWidth={2} />
                        Discrepancy
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#D4B483]/40 bg-[#D4B483]/12 px-2 py-0.5 text-[10px] text-brand-cream">
                      Happened {formatDate(entry.event_date)}
                    </span>
                    <span className="rounded-full border border-brand-preservation/40 bg-brand-preservation/16 px-2 py-0.5 text-[10px] text-brand-glint">
                      Written {formatDate(entry.documented_date)}
                    </span>
                    {entry.documented_date &&
                      entry.event_date &&
                      entry.documented_date !== entry.event_date && (
                        <span className="text-[10px] uppercase tracking-[0.1em] text-brand-body/48">
                          {Math.round(
                            (new Date(`${entry.documented_date}T00:00:00`) -
                              new Date(`${entry.event_date}T00:00:00`)) /
                              86400000
                          )}{" "}
                          days later
                        </span>
                      )}
                  </div>

                  {linked.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[#E6C2BF]/12 pt-2.5">
                      {linked.map((record) => (
                        <button
                          key={record.id}
                          type="button"
                          onClick={() => openSource(record, { page: 1 })}
                          className="rounded-full border border-[#E6C2BF]/25 px-2.5 py-1 text-[10.5px] text-brand-glint/85 transition-all duration-300 hover:border-[#F9EBE5]/70 hover:text-[#F9EBE5] hover:shadow-[0_0_18px_rgba(230,194,191,0.28)]"
                        >
                          {record.title}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex justify-end gap-2">
                    <button
                      type="button"
                      aria-label="Edit entry"
                      onClick={() => {
                        setEditing(entry);
                        setDialogOpen(true);
                      }}
                      className="text-brand-body/55 hover:text-[#F9EBE5]"
                    >
                      <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      aria-label="Remove entry"
                      onClick={() => remove(entry)}
                      className="text-brand-body/55 hover:text-brand-glint"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="px-1 text-[10.5px] leading-relaxed text-brand-body/55">
        {sorted[0] ? `Earliest entry ${formatLongDate(sorted[0].event_date)}.` : ""} A difference
        between the two dates is not proof of anything by itself. It is a question worth asking.
      </p>

      <EventFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        onSave={save}
        initial={editing}
        recordOptions={records}
      />
    </div>
  );
}