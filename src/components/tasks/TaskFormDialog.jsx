import { useState } from "react";
import { toast } from "sonner";
import ResponsiveDialog from "@/components/common/ResponsiveDialog";
import { Field, inputClass, goldButton, ghostButton } from "@/components/common/FormField";
import { TASK_STAGE_OPTIONS } from "@/lib/domain";

export default function TaskFormDialog({ open, onOpenChange, onSave, issues = [] }) {
  const [form, setForm] = useState({
    title: "",
    stage: "Hearing Preparation",
    due_date: "",
    linked_issue_id: "",
  });
  const [saving, setSaving] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      toast("Describe the task in a few words.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        title: form.title.trim(),
        stage: form.stage,
        due_date: form.due_date || null,
        linked_issue_id: form.linked_issue_id || null,
        completed: false,
      });
      setForm({ title: "", stage: form.stage, due_date: "", linked_issue_id: "" });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add a follow-up task"
      description="Name the action and the date it needs to happen by."
    >
      <form onSubmit={submit} className="space-y-3">
        <Field label="Task">
          <input
            className={inputClass}
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            placeholder="Request the provider attendance log"
            required
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Stage">
            <select
              className={inputClass}
              value={form.stage}
              onChange={(event) => update("stage", event.target.value)}
            >
              {TASK_STAGE_OPTIONS.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Due date">
            <input
              type="date"
              className={inputClass}
              value={form.due_date}
              onChange={(event) => update("due_date", event.target.value)}
            />
          </Field>
        </div>
        {issues.length > 0 && (
          <Field label="Connected issue (optional)">
            <select
              className={inputClass}
              value={form.linked_issue_id}
              onChange={(event) => update("linked_issue_id", event.target.value)}
            >
              <option value="">No issue connected</option>
              {issues.map((issue) => (
                <option key={issue.id} value={issue.id}>
                  {issue.title}
                </option>
              ))}
            </select>
          </Field>
        )}
        <div className="flex justify-end gap-2 pt-1">
          <button type="button" className={ghostButton} onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button type="submit" className={goldButton} disabled={saving}>
            {saving ? "Saving…" : "Add task"}
          </button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}