import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Check, Trash2, AlertCircle, Loader2, ListChecks } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import TaskFormDialog from "@/components/tasks/TaskFormDialog";
import AuditTrail from "@/components/common/AuditTrail";
import { goldButton, ghostButton } from "@/components/common/FormField";
import { useCase } from "@/components/case/CaseContext";
import { TASK_STAGE_OPTIONS, formatDate } from "@/lib/domain";
import { base44 } from "@/api/base44Client";
import { logAudit } from "@/lib/audit";

export const Route = createFileRoute("/_authed/tasks")({
  head: () => ({ meta: [{ title: "Follow-Up Tasks · WE THE PARENT™" }] }),
  component: TasksPage,
});

function TasksPage() {
  const { activeCase, tasks, issues, loading, reload } = useCase();
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const openTasks = tasks.filter((task) => !task.completed);
  const overdue = openTasks.filter((task) => task.due_date && task.due_date < today);

  const addTask = async (payload) => {
    if (!activeCase) return;
    await base44.entities.ActionTask.create({ ...payload, case_id: activeCase.id });
    await logAudit({
      caseId: activeCase.id,
      entityType: "ActionTask",
      entityId: activeCase.id,
      entityLabel: payload.title,
      action: "created",
      detail: `Task added in stage ${payload.stage}.`,
    });
    toast.success("Task added.");
    reload();
  };

  const toggle = async (task) => {
    await base44.entities.ActionTask.update(task.id, { completed: !task.completed });
    toast.success(task.completed ? "Task reopened." : "Task complete.");
    reload();
  };

  const remove = async (task) => {
    await base44.entities.ActionTask.delete(task.id);
    await logAudit({
      caseId: activeCase.id,
      entityType: "ActionTask",
      entityId: task.id,
      entityLabel: task.title,
      action: "deleted",
      detail: "Task removed from the follow-up list.",
    });
    toast.success("Task removed.");
    reload();
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 pb-8">
      <PageHeader
        eyebrow="Tasks & Follow-Up · deadlines & follow-through"
        title="So nothing quietly falls off."
        description="Tasks grouped by stage, with the issue they support attached. Every correction keeps its history."
        actions={
          <button type="button" className={goldButton} onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Add task
          </button>
        }
      />

      <div className="grid gap-2.5 sm:grid-cols-3">
        <Metric label="Open tasks" value={openTasks.length} />
        <Metric label="Complete" value={tasks.length - openTasks.length} />
        <Metric label="Past due" value={overdue.length} accent={overdue.length > 0} />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-8 text-brand-body/72">
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
          <span className="text-[13px]">Loading your follow-ups…</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E6C2BF]/25 p-8 text-center">
          <ListChecks className="mx-auto h-6 w-6 text-brand-glint" strokeWidth={1.5} />
          <p className="mt-2 font-heading text-[20px] text-[#F9EBE5]">No follow-ups yet.</p>
          <p className="mx-auto mt-1.5 max-w-md text-[12.5px] leading-relaxed text-brand-body/72">
            Add what needs to happen next, with the date. A request you made but never recorded is a
            request you cannot prove.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {TASK_STAGE_OPTIONS.map((stage) => {
            const group = tasks.filter((task) => task.stage === stage);
            if (group.length === 0) return null;
            return (
              <section key={stage} className="glass-frosted rounded-xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#D4B483]">
                    {stage}
                  </p>
                  <span className="font-mono text-[10px] text-brand-body/55">{group.length}</span>
                </div>
                <div className="mt-2 space-y-1.5">
                  {group.map((task) => {
                    const late = !task.completed && task.due_date && task.due_date < today;
                    const issue = issues.find((item) => item.id === task.linked_issue_id);
                    return (
                      <div
                        key={task.id}
                        className="flex items-start gap-2.5 rounded-lg border border-[#E6C2BF]/15 bg-[#131414]/35 px-3 py-2.5"
                      >
                        <button
                          type="button"
                          onClick={() => toggle(task)}
                          aria-label={task.completed ? "Reopen task" : "Complete task"}
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                            task.completed
                              ? "border-brand-pathway bg-brand-pathway text-brand-obsidian"
                              : "border-[#E6C2BF]/40 text-transparent hover:border-[#F9EBE5]/80"
                          }`}
                        >
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </button>
                        <div className="min-w-0 flex-1">
                          <p
                            className={`text-[12.5px] leading-snug ${
                              task.completed ? "text-brand-body/55 line-through" : "text-brand-body/92"
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[10px] text-brand-body/55">
                            {task.due_date && (
                              <span className={late ? "flex items-center gap-1 text-brand-glint" : ""}>
                                {late && <AlertCircle className="h-2.5 w-2.5" strokeWidth={2} />}
                                {late ? "Past due " : "Due "}
                                {formatDate(task.due_date)}
                              </span>
                            )}
                            {issue && (
                              <Link
                                to="/issues/$issueId"
                                params={{ issueId: issue.id }}
                                className="text-brand-glint hover:text-[#F9EBE5]"
                              >
                                {issue.title}
                              </Link>
                            )}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => remove(task)}
                          aria-label="Remove task"
                          className="text-brand-body/55 hover:text-brand-glint"
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {activeCase && <AuditTrail caseId={activeCase.id} limit={12} />}

      <TaskFormDialog open={open} onOpenChange={setOpen} onSave={addTask} issues={issues} />
    </div>
  );
}

function Metric({ label, value, accent = false }) {
  return (
    <div className="rounded-xl border border-[#E6C2BF]/25 bg-[#1A1515]/50 px-3 py-2.5">
      <p className={`font-heading text-[24px] leading-none ${accent ? "text-[#E6C2BF]" : "text-[#F9EBE5]"}`}>
        {value}
      </p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-brand-body/48">{label}</p>
    </div>
  );
}