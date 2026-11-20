import { useState } from "react";
import { toast } from "sonner";
import ResponsiveDialog from "@/components/common/ResponsiveDialog";
import { Field, inputClass, goldButton, ghostButton } from "@/components/common/FormField";
import { ISSUE_STATUS_OPTIONS } from "@/lib/domain";

export default function IssueFormDialog({ open, onOpenChange, onSave, initial }) {
  const [form, setForm] = useState({
    title: initial?.title || "",
    summary: initial?.summary || "",
    status: initial?.status || "Open",
  });
  const [saving, setSaving] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      toast("Give the issue a short title.");
      return;
    }
    setSaving(true);
    try {
      await onSave({ ...form, title: form.title.trim(), summary: form.summary.trim() });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initial ? "Edit investigative issue" : "Open an investigative issue"}
      description="An issue is a question you are investigating, not a conclusion about who is right."
    >
      <form onSubmit={submit} className="space-y-3">
        <Field label="Issue title">
          <input
            className={inputClass}
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            placeholder="Disputed Visitation Record"
            required
          />
        </Field>
        <Field label="What is unresolved">
          <textarea
            className={`${inputClass} min-h-[90px] resize-y`}
            value={form.summary}
            onChange={(event) => update("summary", event.target.value)}
            placeholder="Describe the difference between the accounts without deciding who is correct."
          />
        </Field>
        <Field label="Status">
          <select
            className={inputClass}
            value={form.status}
            onChange={(event) => update("status", event.target.value)}
          >
            {ISSUE_STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className={ghostButton} onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button type="submit" className={goldButton} disabled={saving}>
            {saving ? "Saving…" : initial ? "Save issue" : "Open issue"}
          </button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}