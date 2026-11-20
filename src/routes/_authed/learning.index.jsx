import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, Check, Clock, ArrowRight } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { useCase } from "@/components/case/CaseContext";
import { getVoice } from "@/lib/representation";
import { LEARNING_MODULES } from "@/lib/learningContent";

export const Route = createFileRoute("/_authed/learning/")({
  head: () => ({ meta: [{ title: "Learning Lab · WE THE PARENT™" }] }),
  component: LearningPage,
});

function LearningPage() {
  const { progress, activeCase } = useCase();
  const voice = getVoice(activeCase);
  const completed = progress.filter((item) => item.completed).length;
  const percent = Math.round((completed / LEARNING_MODULES.length) * 100);

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4 pb-6">
      <PageHeader
        eyebrow="Learning Lab · ten-part framework"
        title="Understand the process instead of surviving it."
        description={voice.learningDescription}
      />

      <div className="glass-frosted rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-[#D4B483]" strokeWidth={1.5} />
            <p className="text-[12px] font-medium text-brand-body/92">
              {completed} of {LEARNING_MODULES.length} modules complete
            </p>
          </div>
          <span className="font-mono text-[11px] text-brand-glint/80">{percent}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#131414]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#B07878] via-[#E6C2BF] to-[#D4B483]"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="grid gap-2.5 lg:grid-cols-2">
        {LEARNING_MODULES.map((module) => {
          const record = progress.find((item) => Number(item.module_number) === module.number);
          const done = Boolean(record?.completed);
          return (
            <Link
              key={module.number}
              to="/learning/$moduleNumber"
              params={{ moduleNumber: String(module.number) }}
              className="glass-frosted reactive-card flex gap-3 rounded-xl p-4"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-mono text-[13px] ${
                  done
                    ? "border-[#D4B483] bg-[#D4B483] text-[#131414]"
                    : "border-[#E6C2BF]/35 text-[#E6C2BF]"
                }`}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={2} /> : String(module.number).padStart(2, "0")}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading text-[18px] leading-snug text-[#F9EBE5]">{module.title}</h3>
                <p className="mt-0.5 text-[12px] leading-relaxed text-brand-body/62">{module.subtitle}</p>
                <div className="mt-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.12em] text-brand-body/55">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" strokeWidth={1.5} />
                    {module.minutes} min
                  </span>
                  <span>{done ? "Complete" : "Not started"}</span>
                  <ArrowRight className="ml-auto h-3 w-3" strokeWidth={1.5} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="px-1 text-[10.5px] leading-relaxed text-brand-body/55">
        {voice.learningFooter}
      </p>
    </div>
  );
}