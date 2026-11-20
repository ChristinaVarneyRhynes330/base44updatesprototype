import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, ShieldAlert, LogOut, Plus, FolderPlus, Scale } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/common/PageHeader";
import AuditTrail from "@/components/common/AuditTrail";
import { Field, inputClass, goldButton, ghostButton } from "@/components/common/FormField";
import { useCase } from "@/components/case/CaseContext";
import { useAuth } from "@/lib/AuthContext";
import { formatDate } from "@/lib/domain";
import { base44 } from "@/api/base44Client";
import {
  isRepresented,
  REPRESENTATION_HINTS,
  REPRESENTATION_OPTIONS,
} from "@/lib/representation";

export const Route = createFileRoute("/_authed/settings")({
  head: () => ({ meta: [{ title: "Settings · WE THE PARENT™" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = Route.useRouteContext();
  const { logout } = useAuth();
  const { cases, activeCase, selectCase, createCase, reload } = useCase();
  const [form, setForm] = useState({
    title: "",
    case_number: "",
    jurisdiction: "",
    representation: "Represented by counsel",
  });
  const [creating, setCreating] = useState(false);
  const [counsel, setCounsel] = useState({ name: "", contact: "" });
  const represented = isRepresented(activeCase);

  useEffect(() => {
    setCounsel({
      name: activeCase?.counsel_name || "",
      contact: activeCase?.counsel_contact || "",
    });
  }, [activeCase?.id, activeCase?.counsel_name, activeCase?.counsel_contact]);

  const setRepresentation = async (value) => {
    if (!activeCase || activeCase.representation === value) return;
    await base44.entities.CaseWorkspace.update(activeCase.id, { representation: value });
    toast.success(`${value} — the workspace voice is updated.`);
    reload();
  };

  const saveCounsel = async () => {
    if (!activeCase) return;
    await base44.entities.CaseWorkspace.update(activeCase.id, {
      counsel_name: counsel.name.trim(),
      counsel_contact: counsel.contact.trim(),
    });
    toast.success("Attorney contact saved.");
    reload();
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) {
      toast("Give the workspace a title.");
      return;
    }
    setCreating(true);
    try {
      await createCase({
        title: form.title.trim(),
        case_number: form.case_number.trim(),
        jurisdiction: form.jurisdiction.trim(),
        status: "Active",
        representation: form.representation,
      });
      setForm({
        title: "",
        case_number: "",
        jurisdiction: "",
        representation: form.representation,
      });
      toast.success("New case workspace created. It is empty until you add records.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 pb-8">
      <PageHeader
        eyebrow="Settings & privacy"
        title="Your account, your cases, your guardrails."
        description="Private storage, account authorization, and controlled access to case materials sit underneath every module."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="glass-frosted rounded-xl p-4">
          <p className="eyebrow">Account</p>
          <div className="mt-2 space-y-1">
            <p className="font-heading text-[20px] text-[#F9EBE5]">{user?.full_name || "Parent"}</p>
            <p className="text-[12px] text-brand-body/72">{user?.email}</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-brand-body/55">
              Role: {user?.role || "user"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className={`${ghostButton} mt-4`}
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
            Sign out
          </button>
        </section>

        <section className="glass-frosted rounded-xl p-4">
          <p className="eyebrow">Case workspaces</p>
          <div className="mt-2 space-y-1.5">
            {cases.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  selectCase(item);
                  toast.success(`Switched to ${item.title}.`);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                  activeCase?.id === item.id
                    ? "border-[#E6C2BF]/50 bg-[#7A4E4A]/20"
                    : "border-[#E6C2BF]/18 hover:border-[#E6C2BF]/45"
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[12.5px] text-brand-body/92">{item.title}</span>
                  <span className="block text-[10px] uppercase tracking-[0.1em] text-brand-body/55">
                    {item.case_number || "No number"} · {item.status}
                  </span>
                </span>
                {activeCase?.id === item.id && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-[#D4B483]" strokeWidth={1.5} />
                )}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10.5px] text-brand-body/55">
            Opened {formatDate((activeCase?.created_date || "").slice(0, 10))}
          </p>
        </section>
      </div>

      <section className="glass-frosted rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Scale className="h-4 w-4 text-[#D4B483]" strokeWidth={1.5} />
          <p className="eyebrow">How you are represented</p>
        </div>
        <p className="mt-1.5 text-[12px] leading-relaxed text-brand-body/72">
          Set once per matter. The workspace changes voice: material prepared for your attorney to act
          on, or material prepared for you to raise and file yourself.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {REPRESENTATION_OPTIONS.map((option) => {
            const selected = (activeCase?.representation || "Represented by counsel") === option;
            return (
              <button
                key={option}
                type="button"
                disabled={!activeCase}
                onClick={() => setRepresentation(option)}
                className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  selected
                    ? "border-[#E6C2BF]/55 bg-[#7A4E4A]/25"
                    : "border-[#E6C2BF]/18 hover:border-[#E6C2BF]/45"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[12.5px] text-brand-body/92">{option}</span>
                  {selected && <Check className="h-3.5 w-3.5 text-[#D4B483]" strokeWidth={1.5} />}
                </span>
                <span className="mt-0.5 block text-[10.5px] leading-relaxed text-brand-body/55">
                  {REPRESENTATION_HINTS[option]}
                </span>
              </button>
            );
          })}
        </div>

        {represented && (
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <Field label="Attorney name">
              <input
                className={inputClass}
                value={counsel.name}
                onChange={(event) => setCounsel({ ...counsel, name: event.target.value })}
                placeholder="Counsel or legal aid office"
              />
            </Field>
            <Field label="Attorney contact">
              <input
                className={inputClass}
                value={counsel.contact}
                onChange={(event) => setCounsel({ ...counsel, contact: event.target.value })}
                placeholder="Email or phone"
              />
            </Field>
            <div className="flex items-end">
              <button type="button" className={ghostButton} onClick={saveCounsel}>
                Save
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="glass-frosted rounded-xl p-4">
        <div className="flex items-center gap-2">
          <FolderPlus className="h-4 w-4 text-[#D4B483]" strokeWidth={1.5} />
          <p className="eyebrow">Start another case workspace</p>
        </div>
        <form onSubmit={submit} className="mt-3 grid gap-3 sm:grid-cols-4">
          <Field label="Title">
            <input
              className={inputClass}
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              placeholder="Dependency case — 2026"
            />
          </Field>
          <Field label="Case number">
            <input
              className={inputClass}
              value={form.case_number}
              onChange={(event) => setForm({ ...form, case_number: event.target.value })}
              placeholder="24-DEP-00000"
            />
          </Field>
          <Field label="Jurisdiction">
            <input
              className={inputClass}
              value={form.jurisdiction}
              onChange={(event) => setForm({ ...form, jurisdiction: event.target.value })}
              placeholder="County · Division"
            />
          </Field>
          <Field label="Representation">
            <select
              className={inputClass}
              value={form.representation}
              onChange={(event) => setForm({ ...form, representation: event.target.value })}
            >
              {REPRESENTATION_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          <div className="sm:col-span-4">
            <button type="submit" className={goldButton} disabled={creating}>
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              {creating ? "Creating…" : "Create workspace"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-[#E6C2BF]/25 bg-[#1A1515]/50 p-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-[#D4B483]" strokeWidth={1.5} />
          <p className="eyebrow">Jurisdiction &amp; verification</p>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-brand-body/62">
          WE THE PARENT organizes evidence and education. It does not provide legal advice, does not
          determine that any person or agency is right or wrong, and cannot verify a rule for your
          jurisdiction. Statutes, deadlines, and procedural requirements vary; confirm them with{" "}
          {represented
            ? "your attorney and the official rules of your court."
            : "your court's clerk, its self-help center, and the official rules of your court."}
        </p>
        <p className="mt-2 text-[12px] leading-relaxed text-brand-body/62">
          Every AI answer is anchored to a page and a quoted sentence from a record you uploaded, or it
          says the records cannot answer. Generated material is always stamped DRAFT — NOT FILED OR
          SERVED.
        </p>
      </section>

      {activeCase && <AuditTrail caseId={activeCase.id} limit={40} title="Correction & audit log" />}
    </div>
  );
}