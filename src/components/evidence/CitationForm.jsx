import { useState } from "react";
import { toast } from "sonner";
import { Field, inputClass, goldButton, ghostButton } from "@/components/common/FormField";
import { EPISTEMIC_OPTIONS } from "@/lib/domain";
import { base44 } from "@/api/base44Client";
import { logAudit } from "@/lib/audit";

export default function CitationForm({ record, issues = [], defaultPage = 1, onSaved, onCancel }) {
  const pages = record.pages?.length ? record.pages : [record.raw_text || ""];
  const [page, setPage] = useState(defaultPage);
  const [quote, setQuote] = useState("");
  const [epistemic, setEpistemic] = useState("Observation");
  const [issueId, setIssueId] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    const trimmed = quote.trim();
    if (trimmed.length < 8) {
      setError("Copy at least a full phrase from the record.");
      return;
    }
    const haystack = (pages[page - 1] || "").replace(/\s+/g, " ");
    if (!haystack.includes(trimmed.replace(/\s+/g, " "))) {
      setError(`That wording was not found on page ${page}. Quoted statements must match the record exactly.`);
      return;
    }
    setError("");
    setSaving(true);
    try {
      await base44.entities.StatementCitation.create({
        case_id: record.case_id,
        record_id: record.id,
        page_number: page,
        exact_quote: trimmed,
        epistemic_type: epistemic,
        linked_issue_id: issueId || null,
        note: note.trim(),
      });
      await logAudit({
        caseId: record.case_id,
        entityType: "StatementCitation",
        entityId: record.id,
        entityLabel: record.title,
        action: "created",
        detail: `Statement tagged as ${epistemic} on page ${page}: "${trimmed.slice(0, 90)}"`,
      });
      toast.success("Statement tagged and linked to its page.");
      setQuote("");
      setNote("");
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-[#E6C2BF]/22 bg-[#131414]/50 p-3.5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Page">
          <select
            className={inputClass}
            value={page}
            onChange={(event) => setPage(Number(event.target.value))}
          >
            {pages.map((_, index) => (
              <option key={index} value={index + 1}>
                Page {index + 1}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Statement type">
          <select
            className={inputClass}
            value={epistemic}
            onChange={(event) => setEpistemic(event.target.value)}
          >
            {EPISTEMIC_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Exact quote" hint="Copy the sentence from the record text; it must match word for word.">
        <textarea
          className={`${inputClass} min-h-[80px] resize-y`}
          value={quote}
          onChange={(event) => setQuote(event.target.value)}
          placeholder="Paste the exact sentence here"
        />
      </Field>
      {issues.length > 0 && (
        <Field label="Link to an investigative issue (optional)">
          <select className={inputClass} value={issueId} onChange={(event) => setIssueId(event.target.value)}>
            <option value="">No issue linked</option>
            {issues.map((issue) => (
              <option key={issue.id} value={issue.id}>
                {issue.title}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Why it matters (optional)">
        <input
          className={inputClass}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="This is the sentence the summary changes."
        />
      </Field>
      {error && <p className="text-[11.5px] leading-relaxed text-brand-glint">{error}</p>}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" className={ghostButton} onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className={goldButton} disabled={saving}>
          {saving ? "Tagging…" : "Tag statement"}
        </button>
      </div>
    </form>
  );
}