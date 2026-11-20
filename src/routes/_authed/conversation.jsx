import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageSquare, Loader2, AlertCircle } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import AiInsightCard from "@/components/conversation/AiInsightCard";
import { useCase } from "@/components/case/CaseContext";
import { useSourceViewer } from "@/components/shell/SourceViewerContext";
import { askCaseAssistant } from "@/lib/server-fns";

export const Route = createFileRoute("/_authed/conversation")({
  head: () => ({ meta: [{ title: "Case Conversation · WE THE PARENT™" }] }),
  validateSearch: (search) => ({ q: typeof search.q === "string" ? search.q : undefined }),
  component: ConversationPage,
});

const SAMPLE_QUESTIONS = [
  "Do these two records give the same meeting date?",
  "Which records mention my visitation schedule?",
  "Where does my case plan require this service?",
  "What information is missing from the records I have?",
];

const DEMO_PROMPTS = [
  "Compare the meeting date in the contact note and the monthly summary.",
  "What does the court order say about notice for a schedule change?",
  "Which records support or dispute the claim that a visit was missed?",
];

function ConversationPage() {
  const { q } = Route.useSearch();
  const { activeCase, records, loading, issues } = useCase();
  const { openSource } = useSourceViewer();
  const ask = useServerFn(askCaseAssistant);
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const askedRef = useRef("");

  const submit = useCallback(
    async (question) => {
      if (!activeCase || !question?.trim() || pending) return;
      setMessages((current) => [
        ...current,
        { id: `u-${Date.now()}`, role: "user", text: question.trim() },
      ]);
      setPending(true);
      try {
        const result = await ask({ data: { caseId: activeCase.id, question: question.trim() } });
        setMessages((current) => [
          ...current,
          { id: `a-${Date.now()}`, role: "assistant", result },
        ]);
      } catch (error) {
        setMessages((current) => [
          ...current,
          {
            id: `e-${Date.now()}`,
            role: "error",
            text: "The assistant could not complete that check. Your records are unchanged.",
          },
        ]);
      } finally {
        setPending(false);
      }
    },
    [activeCase, ask, pending]
  );

  useEffect(() => {
    if (q && q !== askedRef.current && activeCase) {
      askedRef.current = q;
      submit(q);
    }
  }, [q, activeCase, submit]);

  const handleCite = (record, citation) => {
    openSource(record, { page: citation.page_number, quote: citation.quote });
  };

  const prompts = records.length > 0 ? SAMPLE_QUESTIONS : DEMO_PROMPTS;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <PageHeader
        eyebrow="Ask My Case · source-grounded conversation"
        title="Ask your records, not the internet."
        description="Every answer stays anchored to a page and a sentence. Open a citation and the source appears beside your question."
        badge={
          <span className="rounded-full border border-[#E6C2BF]/40 px-2.5 py-0.5 text-[9.5px] uppercase tracking-[0.14em] text-[#E6C2BF]">
            Fictional demo
          </span>
        }
      />

      {messages.length === 0 && (
        <div className="glass-frosted rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-[#D4B483]" strokeWidth={1.5} />
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#E6C2BF]">
              {activeCase?.title || "Loading your case workspace"}
            </p>
          </div>
          <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-brand-glint/85">
            {loading
              ? "Opening your private workspace and loading the records connected to it."
              : `${records.length} records and ${issues.length} investigative issue connected. Ask a question and the assistant will point to the exact page it used, or tell you the records cannot answer it.`}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {prompts.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => submit(question)}
                className="rounded-lg border border-[#E6C2BF]/25 bg-[#1A1515]/50 p-3 text-left text-[12.5px] leading-snug text-brand-body/92 transition-all duration-300 hover:border-[#F9EBE5]/75 hover:shadow-[0_0_22px_rgba(230,194,191,0.26)]"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {messages.map((message) => {
          if (message.role === "user") {
            return (
              <div key={message.id} className="flex justify-end">
                <div className="glass-clear max-w-[85%] rounded-xl px-4 py-2.5 text-[13px] leading-relaxed text-[#F8F0EE]">
                  {message.text}
                </div>
              </div>
            );
          }
          if (message.role === "error") {
            return (
              <div
                key={message.id}
                className="flex items-start gap-2 rounded-xl border border-[#B07878]/50 bg-[#B07878]/15 p-3"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-glint" strokeWidth={1.5} />
                <p className="text-[12.5px] leading-relaxed text-brand-body/92">{message.text}</p>
              </div>
            );
          }
          return (
            <div key={message.id} className="space-y-2">
              <AiInsightCard result={message.result} records={records} onCite={handleCite} />
              <p className="px-1 text-[10px] uppercase tracking-[0.14em] text-brand-body/55">
                Citation quote verified against the record text before display
              </p>
            </div>
          );
        })}

        {pending && (
          <div className="glass-frosted flex items-center gap-3 rounded-xl p-4">
            <Loader2 className="h-4 w-4 animate-spin text-[#F9EBE5]" strokeWidth={1.5} />
            <p className="text-[12.5px] text-brand-body">
              Reading your records and checking each citation against the page…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}