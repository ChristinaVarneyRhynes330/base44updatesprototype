import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, BookOpen } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import AudioNarration from "@/components/learning/AudioNarration";
import { goldButton, ghostButton, inputClass } from "@/components/common/FormField";
import { useCase } from "@/components/case/CaseContext";
import { LEARNING_MODULES, getModule, moduleNarration } from "@/lib/learningContent";
import { base44 } from "@/api/base44Client";

export const Route = createFileRoute("/_authed/learning/$moduleNumber")({
  head: () => ({ meta: [{ title: "Lesson · WE THE PARENT™" }] }),
  component: LessonPage,
});

function LessonPage() {
  const { moduleNumber } = Route.useParams();
  const { user } = Route.useRouteContext();
  const { progress, reload } = useCase();
  const module = getModule(moduleNumber);
  const existing = progress.find((item) => Number(item.module_number) === Number(moduleNumber));
  const [reflection, setReflection] = useState(existing?.user_reflection_note || "");
  const [completed, setCompleted] = useState(Boolean(existing?.completed));
  const [answer, setAnswer] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setReflection(existing?.user_reflection_note || "");
    setCompleted(Boolean(existing?.completed));
  }, [existing?.id, existing?.updated_date]);

  if (!module) {
    return (
      <div className="mx-auto max-w-lg space-y-3 py-10 text-center">
        <p className="font-heading text-[22px] text-[#F9EBE5]">That module does not exist.</p>
        <Link to="/learning" className={ghostButton}>
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Back to the Learning Lab
        </Link>
      </div>
    );
  }

  const persist = async (nextCompleted) => {
    setSaving(true);
    try {
      const payload = {
        module_number: module.number,
        module_title: module.title,
        completed: nextCompleted,
        user_reflection_note: reflection.trim(),
        user_id: user?.id || "",
      };
      if (existing) await base44.entities.LearningModuleProgress.update(existing.id, payload);
      else await base44.entities.LearningModuleProgress.create(payload);
      setCompleted(nextCompleted);
      toast.success(nextCompleted ? "Lesson marked complete." : "Progress saved.");
      reload();
    } finally {
      setSaving(false);
    }
  };

  const next = LEARNING_MODULES.find((item) => item.number === module.number + 1);
  const previous = LEARNING_MODULES.find((item) => item.number === module.number - 1);
  const check = module.knowledgeCheck;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link to="/learning" className="inline-flex items-center gap-1.5 text-[12px] text-brand-glint hover:text-[#F9EBE5]">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Learning Lab
        </Link>
        <AudioNarration text={moduleNarration(module)} />
      </div>

      <PageHeader
        eyebrow={`Module ${module.number} of ${LEARNING_MODULES.length}`}
        title={module.title}
        description={module.subtitle}
        badge={
          completed ? (
            <span className="flex items-center gap-1 rounded-full border border-[#8D9D95]/50 bg-[#8D9D95]/14 px-2.5 py-0.5 text-[9.5px] uppercase tracking-[0.12em] text-brand-verified">
              <Check className="h-2.5 w-2.5" strokeWidth={2} />
              Complete
            </span>
          ) : null
        }
      />

      <article className="glass-frosted space-y-4 rounded-xl p-5">
        {module.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-heading text-[20px] leading-snug text-[#F9EBE5]">{section.heading}</h2>
            <p className="mt-1.5 text-[13.5px] leading-[1.72] text-brand-body/85">{section.body}</p>
          </section>
        ))}

        <div className="rounded-lg border border-[#E6C2BF]/35 bg-[#7A4E4A]/20 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-glint">
            {module.example.title}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-brand-body/92">{module.example.body}</p>
        </div>
      </article>

      <section className="glass-frosted rounded-xl p-5">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#D4B483]" strokeWidth={1.5} />
          <p className="eyebrow">Knowledge check</p>
        </div>
        <p className="mt-2 text-[13.5px] leading-relaxed text-brand-body/92">{check.question}</p>
        <div className="mt-3 space-y-2">
          {check.options.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => setAnswer(index)}
              className={`flex w-full items-start gap-2.5 rounded-lg border p-3 text-left text-[12.5px] leading-snug transition-all duration-300 ${
                answer === index
                  ? index === check.answerIndex
                    ? "border-[#8D9D95]/60 bg-[#8D9D95]/14 text-brand-verified"
                    : "border-[#B07878]/60 bg-[#B07878]/16 text-brand-glint"
                  : "border-[#E6C2BF]/22 bg-[#131414]/40 text-brand-glint/85 hover:border-[#E6C2BF]/55"
              }`}
            >
              <span className="font-mono text-[10px] text-brand-glint">{String.fromCharCode(65 + index)}</span>
              {option}
            </button>
          ))}
        </div>
        {answer !== null && (
          <p className="mt-3 rounded-lg border border-[#E6C2BF]/25 bg-[#131414]/45 p-3 text-[12px] leading-relaxed text-brand-body/80">
            {check.explanation}
          </p>
        )}
      </section>

      <section className="glass-frosted rounded-xl p-5">
        <p className="eyebrow">Explain in your own words</p>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-brand-body/72">{module.reflectionPrompt}</p>
        <textarea
          value={reflection}
          onChange={(event) => setReflection(event.target.value)}
          placeholder="Your own words are the point. Nobody else reads this."
          className={`${inputClass} mt-2 min-h-[110px] resize-y text-[12.5px]`}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="button" className={goldButton} onClick={() => persist(true)} disabled={saving}>
            {saving ? "Saving…" : completed ? "Save reflection" : "Save and mark complete"}
          </button>
          {completed && (
            <button type="button" className={ghostButton} onClick={() => persist(false)} disabled={saving}>
              Mark not complete
            </button>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2">
        {previous ? (
          <Link
            to="/learning/$moduleNumber"
            params={{ moduleNumber: String(previous.number) }}
            className={ghostButton}
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Module {previous.number}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to="/learning/$moduleNumber"
            params={{ moduleNumber: String(next.number) }}
            className={goldButton}
          >
            Module {next.number}: {next.title}
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        ) : (
          <Link to="/learning" className={goldButton}>
            Finish the Learning Lab
          </Link>
        )}
      </div>
    </div>
  );
}