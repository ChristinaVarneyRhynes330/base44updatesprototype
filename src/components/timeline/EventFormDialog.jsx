import { useState } from "react";
import { toast } from "sonner";
import ResponsiveDialog from "@/components/common/ResponsiveDialog";
import { Field, inputClass, goldButton, ghostButton } from "@/components/common/FormField";

export default function EventFormDialog({ open, onOpenChange, onSave, initial, recordOptions = [] }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    event_date: initial?.event_date || "",
    documented_date: initial?.documented_date || "",
    description: initial?.description || "",
    discrepancy_flag: Boolean(initial?.discrepancy_flag),
    linked_record_ids: initial?.linked_record_ids || [],
  });
  const [saving, setSaving] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const toggleRecord = (id) => {
    update(
      "linked_record_ids",
      form.linked_record_ids.includes(id)
        ? form.linked_record_ids.filter((item) => item !== id)
        : [...form.linked_record_ids, id]
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.event_date) {
      toast("An event needs a title and the date it happened.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        ...form,
        title: form.title.trim(),
        documented_date: form.documented_date || null,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initial ? "Edit timeline entry" : "Add a timeline entry"}
      description="Keep the date it happened separate from the date someone wrote it down. That gap is often the whole story."
    >
      <form onSubmit={submit} className="space-y-3">
        <Field label="What happened">
          <input
            className={inputClass}
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            placeholder="Visit reported as missed"
            required
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Event date" hint="When it actually happened">
            <input
              type="date"
              className={inputClass}
              value={form.event_date}
              onChange={(event) => update("event_date", event.target.value)}
              required
            />
          </Field>
          <Field label="Documented date" hint="When it was recorded">
            <input
              type="date"
              className={inputClass}
              value={form.documented_date}
              onChange={(event) => update("documented_date", event.target.value)}
            />
          </Field>
        </div>
        <Field label="Description">
          <textarea
            className={`${inputClass} min-h-[80px] resize-y`}
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="What the records say about this event."
          />
        </Field>
        <label className="flex items-start gap-2 rounded-lg border border-[#E6C2BF]/22 bg-[#131414]/40 p-3">
          <input
            type="checkbox"
            checked={form.discrepancy_flag}
            onChange={(event) => update("discrepancy_flag", event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-[#D4B483]"
          />
          <span className="text-[12px] leading-relaxed text-brand-glint/85">
            Records conflict about this event
            <span className="mt-0.5 block text-[10.5px] text-brand-body/55">
              The entry is marked as a discrepancy so it stands out in the timeline.
            </span>
          </span>
        </label>
        {recordOptions.length > 0 && (
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-glint/80">
              Link source records
            </p>
            <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-[#E6C2BF]/20 p-2">
              {recordOptions.map((record) => (
                <label key={record.id} className="flex items-center gap-2 py-1 text-[12px] text-brand-glint/85">
                  <input
                    type="checkbox"
                    checked={form.linked_record_ids.includes(record.id)}
                    onChange={() => toggleRecord(record.id)}
                    className="h-3.5 w-3.5 accent-[#D4B483]"
                  />
                  <span className="truncate">{record.title}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className={ghostButton} onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button type="submit" className={goldButton} disabled={saving}>
            {saving ? "Saving…" : initial ? "Save entry" : "Add entry"}
          </button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}