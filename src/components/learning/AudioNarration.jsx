import { useEffect, useState } from "react";
import { Play, Pause, Square, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

const RATES = [0.75, 1, 1.25, 1.5];

export default function AudioNarration({ text }) {
  const [supported, setSupported] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rate, setRate] = useState(1);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = () => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.onend = () => {
      setSpeaking(false);
      setPaused(false);
    };
    utterance.onerror = () => {
      setSpeaking(false);
      setPaused(false);
    };
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
    setPaused(false);
  };

  const toggle = () => {
    if (!speaking) {
      speak();
      return;
    }
    if (paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  };

  const changeRate = (value) => {
    setRate(value);
    if (speaking) {
      window.speechSynthesis.cancel();
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = value;
        utterance.onend = () => {
          setSpeaking(false);
          setPaused(false);
        };
        window.speechSynthesis.speak(utterance);
      }, 60);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full border border-[#E6C2BF]/28 bg-[#1A1515]/55 px-2 py-1.5">
      <span className="flex items-center gap-1.5 pl-1 text-[10px] uppercase tracking-[0.14em] text-brand-glint/80">
        <Volume2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        Read aloud
      </span>
      <button
        type="button"
        onClick={toggle}
        disabled={!supported}
        aria-label={speaking && !paused ? "Pause narration" : "Play narration"}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E6C2BF]/40 text-[#F9EBE5] transition-colors hover:border-[#F9EBE5]/80 disabled:opacity-40"
      >
        {speaking && !paused ? (
          <Pause className="h-3.5 w-3.5" strokeWidth={1.5} />
        ) : (
          <Play className="h-3.5 w-3.5" strokeWidth={1.5} />
        )}
      </button>
      <button
        type="button"
        onClick={stop}
        disabled={!supported || !speaking}
        aria-label="Stop narration"
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E6C2BF]/25 text-brand-glint transition-colors hover:border-[#F9EBE5]/70 disabled:opacity-30"
      >
        <Square className="h-3 w-3" strokeWidth={1.5} />
      </button>
      <div className="flex items-center gap-1">
        {RATES.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => changeRate(value)}
            className={cn(
              "rounded-full px-2 py-1 font-mono text-[10.5px] transition-colors",
              rate === value
                ? "bg-[#D4B483] text-[#131414]"
                : "text-brand-glint hover:text-[#F9EBE5]"
            )}
          >
            {value.toFixed(2).replace(/0$/, "")}x
          </button>
        ))}
      </div>
      {!supported && (
        <span className="pr-2 text-[10px] text-brand-body/55">Narration is not available in this browser.</span>
      )}
    </div>
  );
}