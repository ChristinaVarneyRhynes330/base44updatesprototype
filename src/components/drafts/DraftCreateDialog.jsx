import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import ResponsiveDialog from "@/components/common/ResponsiveDialog";
import { Field, inputClass, goldButton, ghostButton } from "@/components/common/FormField";
import { DRAFT_TYPE_OPTIONS } from "@/lib/domain";
import { getVoice } from "@/lib/representation";
import { generateDraft } from "@/lib/server-fns";
import { base44 } from "@/api/base44Client";
import { logAudit } from "@/lib/audit";

export default function DraftCreateDialog({
  open,
  onOpenChange,
  caseId,
  issues,
  onCreated,
  representation,
}) {
  const navigate = useNavigate();
  const generate = useServerFn(generateDraft);
  const voice = getVoice({ representation });
  const [draftType, setDraftType] = useState(voice.questionDraftType);
  const [issueId, setIssueId] = useState("");
  const [instruction, setInstruction] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    setDraftType(getVoice({ representation }).questionDraftType);
  }, [representation]);

  const create = async (content, title) => {
    const created = await base44.entities.DraftDocument.create({
      case_id: caseId,
      title,
      draft_type: draftType,
      content,
      status: "DRAFT - NOT FILED",
      linked_citation_ids: [],
    });
    await logAudit({
      caseId,
      entityType: "DraftDocument",
      entityId: created.id,
      entityLabel: created.title,
      action: "created",
      detail: `${draftType} draft created. Status: DRAFT - NOT FILED.`,
    });
    toast.success("Draft created. It remains a draft.");
    onOpenChange(false);
    onCreated?.();
    navigate({ to: "/drafts/$draftId", params: { draftId: created.id } });
  };

  const generateDraftContent = async () => {
    setWorking(true);
    try {
      const draft = await generate({
        data: {
          caseId,
          draftType,
          issueId: issueId || null,
          instruction: instruction.trim() || null,
        },
      });
      await create(draft.content, draft.title);
    } catch (error) {
      toast("The draft could not be generated. You can start a blank draft instead.");
    } finally {
      setWorking(false);
    }
  };

  const startBlank = async () => {
    setWorking(true);
    try {
      await create(
        "DRAFT — NOT FILED OR SERVED\n\n",
        `${draftType} — untitled draft`
      );
    } finally {
      setWorking(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create a source-linked draft"
      description={voice.dialogDescription}
    >
      <div className="space-y-3">
        <Field label="Draft type">
          <select
            className={inputClass}
            value={draftType}
            onChange={(event) => setDraftType(event.target.value)}
          >
            {DRAFT_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Connect an investigative issue (optional)">
          <select
            className={inputClass}
            value={issueId}
            onChange={(event) => setIssueId(event.target.value)}
          >
            <option value="">No issue selected</option>
            {issues.map((issue) => (
              <option key={issue.id} value={issue.id}>
                {issue.title}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label="What should it cover? (optional)"
          hint="Leave blank and the assistant will work from the connected records."
        >
          <textarea
            className={`${inputClass} min-h-[80px] resize-y`}
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            placeholder="Three questions about the meeting date difference."
          />
        </Field>
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className={ghostButton} onClick={startBlank} disabled={working}>
            Start blank
          </button>
          <button type="button" className={goldButton} onClick={generateDraftContent} disabled={working}>
            {working ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
            ) : (
              <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
            )}
            {working ? "Working from your records…" : "Draft with citations"}
          </button>
        </div>
      </div>
    </ResponsiveDialog>
  );
}