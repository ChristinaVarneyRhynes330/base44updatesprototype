import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Loader2, Files } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import RecordCard from "@/components/evidence/RecordCard";
import RecordFormDialog from "@/components/evidence/RecordFormDialog";
import { goldButton, inputClass } from "@/components/common/FormField";
import { useCase } from "@/components/case/CaseContext";
import { useSourceViewer } from "@/components/shell/SourceViewerContext";
import { CATEGORY_OPTIONS, VERIFICATION_OPTIONS, VERIFICATION_STYLES } from "@/lib/domain";
import { base44 } from "@/api/base44Client";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/_authed/evidence/")({
  head: () => ({ meta: [{ title: "Evidence Library · WE THE PARENT™" }] }),
  validateSearch: (search) => ({
    openForm: search.new === 1 || search.new === "1" || search.new === true,
    focus: typeof search.focus === "string" ? search.focus : undefined,
  }),
  component: EvidencePage,
});

function EvidencePage() {
  const { openForm, focus } = Route.useSearch();
  const navigate = useNavigate();
  const { activeCase, records, citations, loading, reload } = useCase();
  const { openSource } = useSourceViewer();
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    if (openForm) setFormOpen(true);
  }, [openForm]);

  const closeForm = () => {
    setFormOpen(false);
    if (openForm) navigate({ to: "/evidence", search: {}, replace: true });
  };

  const citationCounts = useMemo(() => {
    const counts = {};
    citations.forEach((citation) => {
      counts[citation.record_id] = (counts[citation.record_id] || 0) + 1;
    });
    return counts;
  }, [citations]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return records.filter((record) => {
      if (category !== "all" && record.category !== category) return false;
      if (status !== "all" && record.verification_status !== status) return false;
      if (!needle) return true;
      return (
        record.title?.toLowerCase().includes(needle) ||
        record.source_author?.toLowerCase().includes(needle) ||
        record.raw_text?.toLowerCase().includes(needle)
      );
    });
  }, [records, category, status, search]);

  const handleSave = async (payload) => {
    if (!activeCase) return;
    const created = await base44.entities.EvidenceRecord.create({ ...payload, case_id: activeCase.id });
    await logAudit({
      caseId: activeCase.id,
      entityType: "EvidenceRecord",
      entityId: created.id,
      entityLabel: created.title,
      action: "created",
      detail: `Record "${created.title}" added to the evidence library.`,
    });
    toast.success("Record added to your evidence library.");
    reload();
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4">
      <PageHeader
        eyebrow="Evidence Library · preservation & source inspection"
        title="Every record, with its source intact."
        description="Upload a document or paste a text thread. Nothing is summarized away; the original wording stays available beside your analysis."
        actions={
          <button type="button" className={goldButton} onClick={() => setFormOpen(true)}>
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Add record
          </button>
        }
      />

      <div className="glass-frosted rounded-xl p-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-body/55" strokeWidth={1.5} />
            <input
              autoFocus={focus === "search"}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search titles, authors, and record text"
              className={`${inputClass} pl-9`}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className={`${inputClass} min-w-[150px]`}
            >
              <option value="all">All categories</option>
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className={`${inputClass} min-w-[160px]`}
            >
              <option value="all">All statuses</option>
              {VERIFICATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {VERIFICATION_STYLES[option].label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="mt-2 px-1 font-mono text-[10.5px] uppercase tracking-[0.12em] text-brand-body/55">
          {loading ? "Loading records…" : `${filtered.length} of ${records.length} records`}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-brand-body/72">
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
          <span className="text-[13px]">Opening your evidence library…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[#E6C2BF]/25 px-6 py-12 text-center">
          <Files className="h-6 w-6 text-brand-glint" strokeWidth={1.5} />
          <p className="font-heading text-[20px] text-[#F9EBE5]">No records match this view.</p>
          <p className="max-w-sm text-[12.5px] leading-relaxed text-brand-body/72">
            Adjust the filters, or add the record you are looking for. A text message screenshot and a
            court order are both records here.
          </p>
          <button type="button" className={goldButton} onClick={() => setFormOpen(true)}>
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Add record
          </button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              citationCount={citationCounts[record.id] || 0}
              onOpen={(item) => openSource(item, { page: 1 })}
            />
          ))}
        </div>
      )}

      <RecordFormDialog open={formOpen} onOpenChange={(open) => (open ? setFormOpen(true) : closeForm())} onSave={handleSave} />
    </div>
  );
}