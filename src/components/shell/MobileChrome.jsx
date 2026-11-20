import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, MessageSquare, Files, CalendarRange, SearchCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import BrandCrest from "./BrandCrest";
import { NAV_ITEMS } from "./navItems";
import { getVoice } from "@/lib/representation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const BOTTOM_ITEMS = [
  { label: "Ask", to: "/conversation", icon: MessageSquare },
  { label: "Evidence", to: "/evidence", icon: Files },
  { label: "Timeline", to: "/timeline", icon: CalendarRange },
  { label: "Issues", to: "/issues", icon: SearchCheck },
];

export default function MobileChrome({ caseLabel, representation }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="flex items-center justify-between gap-3 border-b border-[#E6C2BF]/20 bg-[#3A2C29]/90 px-4 py-2.5 backdrop-blur-2xl lg:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <BrandCrest size={30} />
          <div className="min-w-0">
            <p className="font-display text-[10px] uppercase leading-tight tracking-[0.2em] text-brand-glint/85">
              We The Parent
            </p>
            <p className="truncate text-[11px] text-brand-body/72">{caseLabel}</p>
          </div>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open case navigation"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E6C2BF]/35 text-[#F9EBE5]"
            >
              <Menu className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[86vw] max-w-xs border-l border-[#E6C2BF]/25 bg-[#1A1515]/95 p-5 backdrop-blur-2xl"
          >
            <p className="eyebrow">All modules</p>
            <nav className="mt-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-[14px]",
                      active
                        ? "border border-[#E6C2BF]/50 bg-[#7A4E4A]/28 text-[#F9EBE5]"
                        : "border border-transparent text-brand-glint/85"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px] text-brand-glint" strokeWidth={1.5} />
                    {item.label}
                  </Link>
                );
              })}
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] text-brand-glint"
              >
                Settings
              </Link>
            </nav>
            <div className="mt-6 rounded-xl border border-[#E6C2BF]/20 bg-[#131414]/70 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#D4B483]">
                Guardrail
              </p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-brand-body/72">
                {getVoice({ representation }).guardrail}
              </p>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-[#E6C2BF]/20 bg-[#1A1515]/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl lg:hidden">
        {BOTTOM_ITEMS.map((item) => {
          const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-1 text-[10px] tracking-wide",
                active ? "text-[#F9EBE5]" : "text-brand-body/48"
              )}
            >
              <Icon className={cn("h-[19px] w-[19px]", active && "drop-shadow-[0_0_6px_rgba(212,180,131,0.55)]")} strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}