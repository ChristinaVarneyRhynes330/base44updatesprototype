import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Eye,
  Scale,
  Sparkles,
  GraduationCap,
  Gavel,
  ListChecks,
  CalendarRange,
  Loader2,
} from "lucide-react";
import { useCase } from "@/components/case/CaseContext";
import { getVoice } from "@/lib/representation";

export const Route = createFileRoute("/_authed/")({
  head: () => ({
    meta: [
      { title: "Overview · WE THE PARENT™" },
      {
        name: "description",
        content:
          "Your private case workspace: evidence, timeline, issues, drafts, and preparation in one place.",
      },
    ],
  }),
  component: OverviewPage,
});

const PILLARS = [
  { label: "Your Case", line: "One private workspace", icon: ShieldCheck },
  { label: "Your Evidence", line: "Every record, sourced", icon: Eye },
  { label: "Your Understanding", line: "Plain-language learning", icon: GraduationCap },
  { label: "Your Voice", line: "Questions, organized", icon: Scale },
];

function OverviewPage() {
  const { user } = Route.useRouteContext();
  const { activeCase, records, issues, tasks, timeline, citations, loading } = useCase();
  const voice = getVoice(activeCase);
  const firstName = (user?.full_name || "").split(" ")[0];
  const discrepancies = records.filter((record) => record.verification_status === "discrepancy");
  const openTasks = tasks.filter((task) => !task.completed);
  const activeIssue = issues[0];
  const conflictingEvents = timeline.filter((event) => event.discrepancy_flag);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-6">
      <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="eyebrow">Overview · start here</p>
          <h1 className="mt-2 font-heading text-[34px] leading-[1.08] text-[#F9EBE5] sm:text-[42px]">
            {firstName ? `${firstName}, your case is` : "Your case is"}{" "}
            <span className="foil-text">held together.</span>
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-brand-glint/85">
            The AI assists. The evidence informs. You decide. Ask a question, open a record, and the
            source stays beside your work.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              to="/conversation"
              className="btn-foil inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold"
            >
              <MessageSquare className="h-4 w-4" strokeWidth={1.75} />
              Ask about your records
            </Link>
            <Link
              to="/evidence"
              className="inline-flex items-center gap-2 rounded-full border border-[#E6C2BF]/40 px-5 py-2.5 text-[13px] text-[#F9EBE5] transition-all duration-300 hover:border-[#F9EBE5]/85 hover:shadow-[0_0_26px_rgba(230,194,191,0.3)]"
            >
              Open evidence library
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        <div className="grid w-full shrink-0 grid-cols-2 gap-2.5 sm:grid-cols-4 lg:w-auto">
          <Metric label="Records" value={loading ? "—" : records.length} />
          <Metric
            label="Open issues"
            value={loading ? "—" : issues.filter((issue) => issue.status !== "Resolved").length}
          />
          <Metric label="Discrepancies" value={loading ? "—" : discrepancies.length} accent />
          <Metric label="Open tasks" value={loading ? "—" : openTasks.length} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="glass-tinted reactive-card rounded-xl p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="eyebrow">Active investigative issue</p>
            {activeIssue && (
              <span className="rounded-full border border-[#F9EBE5]/45 bg-[#131414]/30 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[#F9EBE5]">
                {activeIssue.status}
              </span>
            )}
          </div>
          {loading ? (
            <div className="mt-3 flex items-center gap-2 text-brand-body">
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
              <span className="text-[13px]">Opening your case workspace…</span>
            </div>
          ) : activeIssue ? (
            <>
              <h2 className="mt-2 font-heading text-[26px] leading-tight text-[#F9EBE5]">
                {activeIssue.title}
              </h2>
              <p className="mt-2 max-w-2xl text-[13.5px] leading-relaxed text-brand-body/92">
                {activeIssue.summary || "No summary recorded yet."}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {citations
                  .filter((citation) => citation.linked_issue_id === activeIssue.id)
                  .slice(0, 4)
                  .map((citation) => {
                    const record = records.find((item) => item.id === citation.record_id);
                    return (
                      <span
                        key={citation.id}
                        className="rounded-full border border-[#F9EBE5]/30 bg-[#1A1515]/40 px-2.5 py-1 text-[11px] text-brand-body"
                      >
                        {record?.title || "Record"} · p. {citation.page_number}
                      </span>
                    );
                  })}
              </div>
              <Link
                to="/issues/$issueId"
                params={{ issueId: activeIssue.id }}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#F9EBE5]/50 px-4 py-2 text-[12.5px] text-[#F9EBE5] transition-all duration-300 hover:bg-[#F9EBE5]/10 hover:shadow-[0_0_24px_rgba(230,194,191,0.3)]"
              >
                Open investigative issue
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </>
          ) : (
            <>
              <h2 className="mt-2 font-heading text-[24px] leading-tight text-[#F9EBE5]">
                No investigation open yet.
              </h2>
              <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-brand-body/92">
                When two records describe the same event differently, open an issue and connect both
                statements. The investigator keeps the comparison organized without deciding the answer.
              </p>
              <Link
                to="/issues"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#F9EBE5]/50 px-4 py-2 text-[12.5px] text-[#F9EBE5]"
              >
                Open an issue
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </>
          )}
        </div>

        <div className="glass-frosted rounded-xl p-5">
          <p className="eyebrow">Next steps</p>
          <ul className="mt-3 space-y-3">
            {openTasks.slice(0, 4).map((task) => (
              <li key={task.id} className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#E6C2BF]" />
                <div className="min-w-0">
                  <p className="text-[13px] leading-snug text-brand-body/92">{task.title}</p>
                  <p className="mt-0.5 text-[10.5px] uppercase tracking-[0.1em] text-brand-body/48">
                    {task.stage}
                  </p>
                </div>
              </li>
            ))}
            {openTasks.length === 0 && !loading && (
              <li className="text-[12.5px] leading-relaxed text-brand-body/48">
                No open follow-ups. Add the next action so nothing quietly falls off.
              </li>
            )}
          </ul>
          <Link
            to="/tasks"
            className="mt-4 inline-flex items-center gap-1.5 text-[12px] text-[#E6C2BF] hover:text-[#F9EBE5]"
          >
            All follow-up tasks
            <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <ModuleCard
          to="/timeline"
          icon={CalendarRange}
          eyebrow="Dual-date timeline"
          title="What happened, and when it was written"
          line={`${timeline.length} entries · ${conflictingEvents.length} with conflicting records.`}
        />
        <ModuleCard
          to="/learning"
          icon={GraduationCap}
          eyebrow="Learning lab"
          title="Module 1 · Understanding your objectives"
          line="Ten lessons with narration, knowledge checks, and reflection."
        />
        <ModuleCard
          to="/hearing-prep"
          icon={Gavel}
          eyebrow="Hearing preparation"
          title="Build your packet before the date arrives"
          line="Issues, exhibits, priority questions, and courtroom mode."
        />
      </section>

      <section className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.label}
              className="reactive-card rounded-xl border border-[#E6C2BF]/22 bg-[#1A1515]/45 px-4 py-3.5"
            >
              <Icon className="h-4 w-4 text-[#D4B483]" strokeWidth={1.5} />
              <p className="mt-2 font-heading text-[16px] text-[#F9EBE5]">{pillar.label}</p>
              <p className="mt-0.5 text-[11.5px] text-brand-body/72">{pillar.line}</p>
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-[#E6C2BF]/20 bg-[#1A1515]/45 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#D4B483]" strokeWidth={1.5} />
          <div>
            <p className="text-[12px] font-medium text-brand-body/92">
              {activeCase ? activeCase.title : "Opening your private case workspace"}
            </p>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-brand-body/72">
              {activeCase?.jurisdiction || "—"} · {activeCase?.case_number || "no case number yet"} ·{" "}
              {voice.label}. Every record is stored privately and visible only to your account.
            </p>
          </div>
        </div>
        <Link
          to="/settings"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#E6C2BF]/35 px-4 py-2 text-[12px] text-[#F9EBE5] transition-all duration-300 hover:border-[#F9EBE5]/80"
        >
          <ListChecks className="h-3.5 w-3.5" strokeWidth={1.5} />
          Review case settings
        </Link>
      </section>
    </div>
  );
}

function Metric({ label, value, accent = false }) {
  return (
    <div className="rounded-xl border border-[#E6C2BF]/28 bg-[#3A2C29]/45 px-3 py-2.5 backdrop-blur-xl">
      <p
        className={`font-heading text-[26px] leading-none ${
          accent ? "text-[#E6C2BF]" : "text-[#F9EBE5]"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-brand-body/48">{label}</p>
    </div>
  );
}

function ModuleCard({ to, icon: Icon, eyebrow, title, line }) {
  return (
    <Link to={to} className="glass-frosted reactive-card block rounded-xl p-4">
      <div className="flex items-center justify-between">
        <p className="eyebrow">{eyebrow}</p>
        <Icon className="h-4 w-4 text-[#D4B483]" strokeWidth={1.5} />
      </div>
      <h3 className="mt-2 font-heading text-[19px] leading-snug text-[#F9EBE5]">{title}</h3>
      <p className="mt-1.5 text-[12px] leading-relaxed text-brand-body/72">{line}</p>
    </Link>
  );
}