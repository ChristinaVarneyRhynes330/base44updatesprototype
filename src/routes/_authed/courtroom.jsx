import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { X, Gavel, Check, Save, Loader2, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { useCase } from "@/components/case/CaseContext";
import { inputClass } from "@/components/common/FormField";
import { formatLongDate } from "@/lib/domain";
import { base44 } from "@/api/base44Client";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/_authed/courtroom")({
  head: () => ({ meta: [{ title: "Courtroom Mode · WE THE PARENT™" }] }),
  component: CourtroomPage,
});

function CourtroomPage() {
  const { activeCase, drafts, issues, citations, records, hearingNotes, reload } = useCase();
  const [tab, setTab] = useState("live");
  const [note, setNote] = useState({ requested: "", discussed: "", ruled: "", follow_up: "" });
  const [saving, setSaving] = useState(false);

  const packet = [...drafts]
    .filter((draft) => draft.draft_type === "Hearing Packet")
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))[0];

  const packetIssues = issues.filter((issue) =>
    packet ? packet.content?.includes(issue.title) : true
  );

  const saveNote = async () => {
    if (!activeCase) return;
    if (!note.requested.trim() && !note.discussed.trim() && !note.ruled.trim()) {
      toast("Write at least one line before saving.");
      return;
    }
    setSaving(true);
    try {
      const created = await base44.entities.HearingNote.create({
        case_id: activeCase.id,
        hearing_title: packet?.title || "Hearing",
        hearing_date: new Date().toISOString().slice(0, 10),
        requested: note.requested.trim(),
        discussed: note.discussed.trim(),
        ruled: note.ruled.trim(),
        follow_up: note.follow_up.trim(),
        compared_with_order: false,
      });
      await logAudit({
        caseId: activeCase.id,
        entityType: "HearingNote",
        entityId: created.id,
        entityLabel: created.hearing_title,
        action: "created",
        detail: "Live hearing note recorded during courtroom mode.",
      });
      setNote({ requested: "", discussed: "", ruled: "", follow_up: "" });
      toast.success("Hearing note saved and ready to compare with the written order.");
      reload();
    } finally {
      setSaving(false);
    }
  };

  const toggleCompared = async (entry) => {
    await base44.entities.HearingNote.update(entry.id, {
      compared_with_order: !entry.compared_with_order,
    });
    reload();
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-brand-obsidian text-brand-heading">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-taupe/55 bg-brand-command/45 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <Gavel className="h-4 w-4 shrink-0 text-[#E6C2BF]" strokeWidth={1.5} />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E6C2BF]">
              Courtroom mode
            </p>
            <p className="truncate text-[13px] text-[#F9EBE5]">
              {activeCase?.title || "Case"} · {packet?.title || "No packet saved"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-[#E6C2BF]/35 p-0.5">
            <button
              type="button"
              onClick={() => setTab("live")}
              className={`rounded-full px-3 py-1.5 text-[11.5px] ${
                tab === "live" ? "bg-[#E6C2BF] text-[#131414]" : "text-brand-glint/80"
              }`}
            >
              Live hearing
            </button>
            <button
              type="button"
              onClick={() => setTab("after")}
              className={`rounded-full px-3 py-1.5 text-[11.5px] ${
                tab === "after" ? "bg-[#E6C2BF] text-[#131414]" : "text-brand-glint/80"
              }`}
            >
              After the hearing
            </button>
          </div>
          <Link
            to="/hearing-prep"
            aria-label="Exit courtroom mode"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E6C2BF]/45 text-[#F9EBE5]"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </header>

      {tab === "live" ? (
        <div className="grid min-h-0 flex-1 gap-3 overflow-y-auto p-3 lg:grid-cols-[1.15fr_0.85fr] lg:overflow-hidden">
          <section className="min-h-0 overflow-y-auto surface-command rounded-lg p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E6C2BF]">
              Your packet
            </p>
            {packet ? (
              <pre className="mt-3 whitespace-pre-wrap font-body text-[13px] leading-[1.7] text-brand-body/92">
                {packet.content}
              </pre>
            ) : (
              <div className="mt-3 space-y-2">
                <p className="text-[13px] leading-relaxed text-brand-body/62">
                  No packet has been saved yet. The issues below are still available, and anything you
                  write in the note logger is saved.
                </p>
                {packetIssues.map((issue) => (
                  <div key={issue.id} className="rounded border border-[#E6C2BF]/20 p-3">
                    <p className="text-[13px] text-[#F9EBE5]">{issue.title}</p>
                    <p className="mt-1 text-[11.5px] text-brand-body/72">{issue.summary}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 border-t border-[#E6C2BF]/20 pt-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E6C2BF]">
                Pinned exhibits
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {records.slice(0, 6).map((record) => {
                  const count = citations.filter((citation) => citation.record_id === record.id).length;
                  return (
                    <span
                      key={record.id}
                      className="rounded-full border border-[#E6C2BF]/30 px-2.5 py-1 text-[10.5px] text-brand-body/92"
                    >
                      {record.title} · {count} cited
                    </span>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="min-h-0 overflow-y-auto surface-command rounded-lg p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E6C2BF]">
              Live hearing note
            </p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-brand-body/48">
              Write what happened in the room, not what you hope it means.
            </p>
            <div className="mt-3 space-y-2.5">
              {[
                { key: "requested", label: "What was requested" },
                { key: "discussed", label: "What was discussed" },
                { key: "ruled", label: "What the judge ruled" },
                { key: "follow_up", label: "To verify in the written order" },
              ].map((field) => (
                <label key={field.key} className="block">
                  <span className="mb-1 block text-[9.5px] font-semibold uppercase tracking-[0.14em] text-brand-glint/80">
                    {field.label}
                  </span>
                  <textarea
                    value={note[field.key]}
                    onChange={(event) =>
                      setNote((current) => ({ ...current, [field.key]: event.target.value }))
                    }
                    className={`${inputClass} min-h-[64px] resize-y bg-black/60 text-[12.5px] text-[#F8F0EE]`}
                  />
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={saveNote}
              disabled={saving}
              className="btn-foil mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-[12.5px] font-semibold"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={2} />
              ) : (
                <Save className="h-3.5 w-3.5" strokeWidth={2} />
              )}
              Save hearing note
            </button>
          </section>
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="mx-auto max-w-3xl space-y-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-[#E6C2BF]" strokeWidth={1.5} />
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E6C2BF]">
                Compare your notes with the written order
              </p>
            </div>
            <p className="text-[12px] leading-relaxed text-brand-body/72">
              When the written order arrives, read it beside these notes. What was requested, what was
              discussed, what was ruled, and what was entered are not always the same thing.
            </p>
            {hearingNotes.length === 0 && (
              <p className="rounded-lg border border-dashed border-[#E6C2BF]/30 p-4 text-[12px] text-brand-body/48">
                No hearing notes yet. Record one during the live view.
              </p>
            )}
            {hearingNotes.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-[#E6C2BF]/28 bg-brand-obsidian p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[12.5px] text-[#F9EBE5]">{entry.hearing_title}</p>
                  <span className="font-mono text-[10px] text-brand-body/55">
                    {formatLongDate(entry.hearing_date)}
                  </span>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {[
                    ["Requested", entry.requested],
                    ["Discussed", entry.discussed],
                    ["Ruled", entry.ruled],
                    ["To verify", entry.follow_up],
                  ]
                    .filter(([, value]) => value)
                    .map(([label, value]) => (
                      <div key={label} className="rounded border border-[#E6C2BF]/15 p-2">
                        <p className="text-[9px] uppercase tracking-[0.12em] text-brand-glint/80">{label}</p>
                        <p className="mt-0.5 text-[11.5px] leading-relaxed text-brand-glint/85">{value}</p>
                      </div>
                    ))}
                </div>
                <label className="mt-2.5 flex items-center gap-2 text-[11.5px] text-brand-glint/85">
                  <input
                    type="checkbox"
                    checked={Boolean(entry.compared_with_order)}
                    onChange={() => toggleCompared(entry)}
                    className="h-4 w-4 accent-[#D4B483]"
                  />
                  Compared with the written order
                </label>
              </div>
            ))}
            <Link
              to="/tasks"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#E6C2BF]/40 px-3 py-2 text-[11.5px] text-[#F9EBE5]"
            >
              <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
              Add follow-up tasks
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}