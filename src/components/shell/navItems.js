import { MessageSquare, Files, CalendarRange, SearchCheck, PenLine, Gavel, GraduationCap, ListChecks } from "lucide-react";

/* Destination names follow the canonical experience blueprint. */
export const NAV_ITEMS = [
  { label: "Ask My Case", to: "/conversation", icon: MessageSquare },
  { label: "Evidence Library", to: "/evidence", icon: Files },
  { label: "Timeline", to: "/timeline", icon: CalendarRange },
  { label: "Issue Investigator", to: "/issues", icon: SearchCheck },
  { label: "Drafts & Preparation", to: "/drafts", icon: PenLine },
  { label: "Hearings & Orders", to: "/hearing-prep", icon: Gavel },
  { label: "Learning Lab", to: "/learning", icon: GraduationCap },
  { label: "Tasks & Follow-Up", to: "/tasks", icon: ListChecks },
];

export const MOBILE_NAV = NAV_ITEMS.slice(0, 4).concat([{ label: "More", to: "/more", icon: ListChecks }]);