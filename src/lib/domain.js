export const EPISTEMIC_STYLES = {
  Allegation: "border-[#B07878]/60 bg-[#B07878]/20 text-[#F3D9D6]",
  Observation: "border-[#D4B483]/50 bg-[#D4B483]/16 text-[#F6E7CE]",
  "Parent Recollection": "border-[#8D9D95]/50 bg-[#8D9D95]/16 text-[#DCE7E1]",
  "Professional Opinion": "border-[#C99A92]/50 bg-[#C99A92]/16 text-[#F3E2DC]",
  Inference: "border-[#8C7A73]/55 bg-[#8C7A73]/20 text-[#E5DCD8]",
  "Court Finding": "border-[#F9EBE5]/55 bg-[#F9EBE5]/14 text-[#FBF6F3]",
};

export const VERIFICATION_STYLES = {
  verified: { label: "Verified match", dot: "bg-brand-verified", text: "text-[#B9CFC4]" },
  discrepancy: { label: "Discrepancy detected", dot: "bg-brand-preservation", text: "text-[#F3D9D6]" },
  pending: { label: "Pending review", dot: "bg-brand-gold", text: "text-[#EFE0C9]" },
  missing_context: { label: "Missing attachment", dot: "bg-brand-taupe", text: "text-[#CDC1BC]" },
};

export const CATEGORY_OPTIONS = [
  "Court Order",
  "Petition",
  "Case Plan",
  "Agency Report",
  "Medical Record",
  "Visitation Log",
  "Email",
  "Text Message",
  "Photo",
];

export const ISSUE_STATUS_OPTIONS = ["Open", "Needs Records", "Ready for Counsel", "Resolved"];

export const TASK_STAGE_OPTIONS = [
  "Immediate Filing",
  "Hearing Preparation",
  "Record Comparison",
  "Timeline Entry",
  "Reference Archive",
];

export const DRAFT_TYPE_OPTIONS = [
  "Attorney Questions",
  "Court Questions",
  "Record Request",
  "Hearing Packet",
  "Timeline Summary",
];

export const EPISTEMIC_OPTIONS = [
  "Allegation",
  "Observation",
  "Parent Recollection",
  "Professional Opinion",
  "Inference",
  "Court Finding",
];

export const VERIFICATION_OPTIONS = ["verified", "discrepancy", "pending", "missing_context"];

export const DRAFT_STATUS = "DRAFT - NOT FILED";

export const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const formatLongDate = (value) => {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
};