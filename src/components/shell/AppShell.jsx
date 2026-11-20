import { Outlet, useRouterState } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import LeftRail from "./LeftRail";
import MobileChrome from "./MobileChrome";
import CommandBar from "./CommandBar";
import RightPane from "./RightPane";
import { SourceViewerProvider, useSourceViewer } from "./SourceViewerContext";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { CaseProvider, useCase } from "@/components/case/CaseContext";
import { base44 } from "@/api/base44Client";
import { logAudit } from "@/lib/audit";

// Decorative botanical plane behind the glass surfaces.
const BOTANICAL_PLANE =
  "https://media.base44.com/images/public/6afb141271208457f2c4096e/aee7e3abc_generated_image.png";

export default function AppShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  if (pathname.startsWith("/courtroom")) {
    return (
      <CaseProvider>
        <Outlet />
      </CaseProvider>
    );
  }

  return (
    <CaseProvider>
      <SourceViewerProvider>
        <ShellFrame />
      </SourceViewerProvider>
    </CaseProvider>
  );
}

function ShellFrame() {
  const { source, closeSource } = useSourceViewer();
  const { cases, activeCase, records, citations, selectCase, reload } = useCase();

  const handleAddToTimeline = async (record) => {
    if (!activeCase) return;
    await base44.entities.TimelineEvent.create({
      case_id: activeCase.id,
      title: record.title,
      event_date: record.event_date || record.documented_date,
      documented_date: record.documented_date || record.event_date,
      description: `Added from the source viewer for "${record.title}".`,
      discrepancy_flag: false,
      linked_record_ids: [record.id],
    });
    await logAudit({
      caseId: activeCase.id,
      entityType: "TimelineEvent",
      entityId: record.id,
      entityLabel: record.title,
      action: "created",
      detail: `Timeline entry created from record "${record.title}".`,
    });
    toast.success("Added to your timeline.");
    reload();
  };

  const handleFlagDiscrepancy = async (record) => {
    if (!activeCase) return;
    if (record.verification_status === "discrepancy") {
      toast("This record is already flagged as a discrepancy.");
      return;
    }
    const previous = record.verification_status;
    await base44.entities.EvidenceRecord.update(record.id, { verification_status: "discrepancy" });
    await logAudit({
      caseId: activeCase.id,
      entityType: "EvidenceRecord",
      entityId: record.id,
      entityLabel: record.title,
      action: "flagged",
      detail: `Marked as a discrepancy from the source viewer.`,
      previousValue: previous,
    });
    toast.success("Record flagged. The original status is preserved in the audit log.");
    reload();
  };

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-brand-obsidian text-brand-heading">
      <div className="pointer-events-none absolute inset-0 botanical-backdrop" />
      <div
        className="pointer-events-none absolute inset-0 hidden bg-cover bg-center opacity-30 lg:block"
        style={{ backgroundImage: `url(${BOTANICAL_PLANE})` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-obsidian/70 via-brand-obsidian/85 to-brand-obsidian" />
      <div className="pointer-events-none absolute inset-0 botanical-veil" />

      <LeftRail cases={cases} activeCase={activeCase} onSelectCase={selectCase} />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <MobileChrome
          caseLabel={activeCase?.title || "Case workspace"}
          representation={activeCase?.representation}
        />

        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="flex min-w-0 flex-1 flex-col">
            <GuardrailStrip />
            <main className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5 lg:px-6">
              <Outlet />
            </main>
            <CommandBar />
          </div>

          <RightPane
            source={source}
            record={records[0]}
            citations={citations}
            onAddToTimeline={handleAddToTimeline}
            onFlagDiscrepancy={handleFlagDiscrepancy}
            className="hidden w-[360px] flex-none xl:flex"
          />
        </div>
      </div>

      <Sheet open={Boolean(source)} onOpenChange={(open) => !open && closeSource()}>
        <SheetContent
          side="bottom"
          className="h-[88vh] gap-0 border-t border-[#E6C2BF]/30 bg-[#1A1515]/95 p-0 backdrop-blur-2xl xl:hidden"
        >
          <RightPane
            source={source}
            record={records[0]}
            citations={citations}
            onClose={closeSource}
            onAddToTimeline={handleAddToTimeline}
            onFlagDiscrepancy={handleFlagDiscrepancy}
            className="h-full border-0"
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

function GuardrailStrip() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-glint/16 bg-brand-glass/60 px-3 py-2 backdrop-blur-xl sm:px-5 lg:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-brand-gold" strokeWidth={1.5} />
        <p className="truncate text-[10.5px] uppercase tracking-[0.14em] text-brand-body/72">
          Jurisdiction &amp; verification guardrail · organization and education, not legal advice
        </p>
      </div>
      <span className="shrink-0 rounded-full border border-brand-preservation/55 bg-brand-preservation/20 px-2.5 py-0.5 text-[9.5px] uppercase tracking-[0.16em] text-brand-cream">
        Draft status active
      </span>
    </div>
  );
}