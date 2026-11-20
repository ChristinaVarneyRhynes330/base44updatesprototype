import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, Mic, ArrowUp, FilePlus2, Search, CalendarRange, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const QUICK_ACTIONS = [
  { label: "Add records", to: "/evidence", search: { new: 1 }, icon: FilePlus2 },
  { label: "Search evidence", to: "/evidence", search: { focus: "search" }, icon: Search },
  { label: "View timeline", to: "/timeline", search: {}, icon: CalendarRange },
  { label: "Create draft", to: "/drafts", search: { new: 1 }, icon: PenLine },
];

export default function CommandBar() {
  const [value, setValue] = useState("");
  const [listening, setListening] = useState(false);
  const navigate = useNavigate();

  const submit = (event) => {
    event.preventDefault();
    const question = value.trim();
    if (!question) return;
    setValue("");
    navigate({ to: "/conversation", search: { q: question } });
  };

  const startVoice = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      toast("Voice input is not available in this browser. You can type your question instead.");
      return;
    }
    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setValue((current) => (current ? `${current} ${transcript}` : transcript));
    };
    recognition.start();
  };

  return (
    <div className="border-t border-[#E6C2BF]/12 bg-[#131414]/70 px-3 pb-20 pt-3 backdrop-blur-xl sm:px-5 lg:pb-4">
      <form
        onSubmit={submit}
        className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-full border border-[#E6C2BF]/40 bg-[#1A1515]/85 py-1.5 pl-1.5 pr-1.5 shadow-[0_0_24px_rgba(212,180,131,0.14)] focus-within:border-[#F9EBE5]/80 focus-within:shadow-[0_0_0_3px_rgba(212,180,131,0.16),0_0_28px_rgba(230,194,191,0.3)]"
      >
        <Link
          to="/evidence"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E6C2BF]/35 text-[#F9EBE5] transition-all duration-300 hover:border-[#F9EBE5]/80 hover:shadow-[0_0_18px_rgba(230,194,191,0.35)]"
          aria-label="Add a record"
        >
          <Plus className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </Link>
        <div className="h-6 w-px shrink-0 bg-[#D4B483]/30" />
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Ask about your records..."
          aria-label="Ask about your records"
          className="min-w-0 flex-1 bg-transparent px-1 text-[14px] text-[#F8F0EE] placeholder:text-brand-body/48 focus:outline-none"
        />
        <button
          type="button"
          onClick={startVoice}
          aria-label="Dictate a question"
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300",
            listening ? "bg-[#B07878]/40 text-[#F9EBE5]" : "text-brand-glint hover:text-[#F9EBE5]"
          )}
        >
          <Mic className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </button>
        <button
          type="submit"
          aria-label="Send question"
          className="btn-foil flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
        >
          <ArrowUp className="h-[18px] w-[18px]" strokeWidth={2} />
        </button>
      </form>

      <div className="mx-auto mt-2.5 flex w-full max-w-3xl gap-2 overflow-x-auto no-scrollbar">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.to}
              search={action.search}
              className="flex shrink-0 items-center gap-2 rounded-full border border-[#E6C2BF]/25 bg-[#1A1515]/55 px-3 py-1.5 text-[12px] text-brand-glint/85 transition-all duration-300 hover:border-[#F9EBE5]/80 hover:text-[#F9EBE5] hover:shadow-[0_0_22px_rgba(230,194,191,0.28)]"
            >
              <Icon className="h-3.5 w-3.5 text-brand-glint" strokeWidth={1.5} />
              {action.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}