import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import ResponsiveDialog from "@/components/common/ResponsiveDialog";
import { Field, inputClass, goldButton, ghostButton } from "@/components/common/FormField";
import { CATEGORY_OPTIONS, VERIFICATION_OPTIONS, VERIFICATION_STYLES } from "@/lib/domain";
import { base44 } from "@/api/base44Client";
import { extractRecordText } from "@/lib/server-fns";

/* SHA-256 of the file bytes, captured before upload so the preserved original
   can be identified later. Integrity only — not a statement about content. */
const fingerprint = async (file) => {
  if (!file || typeof crypto === "undefined" || !crypto.subtle) return "";
  try {
    const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  } catch (error) {
    return "";
  }
};

const emptyForm = {
  title: "",
  category: "Agency Report",
  source_author: "",
  event_date: "",
  documented_date: "",
  verification_status: "pending",
  text: "",
};

export default function RecordFormDialog({ open, onOpenChange, onSave, initial }) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          title: initial.title || "",
          category: initial.category || "Agency Report",
          source_author: initial.source_author || "",
          event_date: initial.event_date || "",
          documented_date: initial.documented_date || "",
          verification_status: initial.verification_status || "pending",
          text: (initial.pages || []).join("\n\n") || initial.raw_text || "",
        }
      : emptyForm
  );
  const [fileUri, setFileUri] = useState(initial?.file_url || "");
  const [original, setOriginal] = useState({
    name: initial?.original_filename || "",
    size: initial?.file_size_bytes || 0,
    checksum: initial?.checksum_sha256 || "",
  });
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const extract = useServerFn(extractRecordText);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setExtracting(true);
    try {
      const checksum = await fingerprint(file);
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setFileUri(file_uri);
      setOriginal({ name: file.name, size: file.size, checksum });
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({
        file_uri,
        expires_in: 600,
      });
      const result = await extract({ data: { fileUrl: signed_url } });
      if (result?.error) {
        toast(result.error);
      } else if (result?.text) {
        setForm((current) => ({
          ...current,
          text: result.text,
          title: current.title || file.name.replace(/\.[^.]+$/, ""),
        }));
        toast.success("Text extracted. Review it before saving.");
      } else {
        toast("The file uploaded, but no readable text was found. You can paste the text instead.");
      }
    } catch (error) {
      toast("The file could not be processed. You can still paste the text of the record.");
    } finally {
      setExtracting(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.text.trim()) {
      toast("A record needs a title and some text.");
      return;
    }
    setSaving(true);
    try {
      const pages = form.text
        .split(/\n\s*---\s*(?:page)?\s*---\s*\n/i)
        .map((page) => page.trim())
        .filter(Boolean);
      await onSave({
        title: form.title.trim(),
        category: form.category,
        source_author: form.source_author.trim(),
        event_date: form.event_date || null,
        documented_date: form.documented_date || null,
        verification_status: form.verification_status,
        raw_text: form.text.trim(),
        pages: pages.length ? pages : [form.text.trim()],
        file_url: fileUri || "",
        original_filename: original.name,
        file_size_bytes: original.size,
        checksum_sha256: original.checksum,
      });
      onOpenChange(false);
      if (!initial) setForm(emptyForm);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initial ? "Edit record" : "Add a record"}
      description="Files are stored privately (stored privately). Nothing is shared outside your workspace."
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Record title">
          <input
            className={inputClass}
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            placeholder="Meeting note · May 6"
            required
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Category">
            <select
              className={inputClass}
              value={form.category}
              onChange={(event) => update("category", event.target.value)}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Source author">
            <input
              className={inputClass}
              value={form.source_author}
              onChange={(event) => update("source_author", event.target.value)}
              placeholder="Caseworker, provider, court"
            />
          </Field>
          <Field label="Event date" hint="When it happened">
            <input
              type="date"
              className={inputClass}
              value={form.event_date}
              onChange={(event) => update("event_date", event.target.value)}
            />
          </Field>
          <Field label="Documented date" hint="When it was written down">
            <input
              type="date"
              className={inputClass}
              value={form.documented_date}
              onChange={(event) => update("documented_date", event.target.value)}
            />
          </Field>
        </div>

        <Field label="Verification status">
          <select
            className={inputClass}
            value={form.verification_status}
            onChange={(event) => update("verification_status", event.target.value)}
          >
            {VERIFICATION_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {VERIFICATION_STYLES[option].label}
              </option>
            ))}
          </select>
        </Field>

        <div className="rounded-lg border border-[#E6C2BF]/20 bg-[#131414]/50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-glint/80">
              Record text
            </p>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#E6C2BF]/35 px-3 py-1.5 text-[11.5px] text-[#F9EBE5] transition-colors hover:border-[#F9EBE5]/80">
              {extracting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
              ) : (
                <Upload className="h-3.5 w-3.5" strokeWidth={1.5} />
              )}
              {extracting ? "Reading file…" : "Upload file"}
              <input
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.txt,.docx"
                onChange={handleFile}
                disabled={extracting}
              />
            </label>
          </div>
          <textarea
            className={`${inputClass} mt-2 min-h-[150px] resize-y font-mono text-[12.5px] leading-relaxed`}
            value={form.text}
            onChange={(event) => update("text", event.target.value)}
            placeholder={"Paste the exact text of the record here.\n\nSeparate pages with a line containing --- to keep page numbers accurate."}
          />
          {fileUri && (
            <p className="mt-1.5 text-[10.5px] leading-relaxed text-brand-body/55">
              Original attached and stored privately
              {original.checksum
                ? ` · fingerprint ${original.checksum.slice(0, 16)}… recorded`
                : ""}
              . The fingerprint shows the file has not changed since it was preserved; it does not
              verify what the file says.
            </p>
          )}
        </div>

        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <button type="button" className={ghostButton} onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button type="submit" className={goldButton} disabled={saving}>
            {saving ? "Saving…" : initial ? "Save changes" : "Add to evidence library"}
          </button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}