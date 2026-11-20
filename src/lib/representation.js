/* The four representation states named in the canonical blueprint. */
export const REPRESENTATION_OPTIONS = [
  "Represented by counsel",
  "Limited-scope or standby counsel",
  "Self-represented",
  "Representation uncertain or changing",
];

export const REPRESENTATION_HINTS = {
  "Represented by counsel": "Prepared for your attorney to review and act on.",
  "Limited-scope or standby counsel": "Prepared for the parts of the case your attorney covers.",
  "Self-represented": "Prepared for you to raise, request, and file yourself.",
  "Representation uncertain or changing": "Kept plain and portable until your role is settled.",
};

const DEFAULT_REPRESENTATION = "Represented by counsel";

export const isRepresented = (workspace) =>
  ["Represented by counsel", "Limited-scope or standby counsel"].includes(
    workspace?.representation || DEFAULT_REPRESENTATION
  );

const COUNSEL = {
  key: "counsel",
  label: "Represented by counsel",
  reviewer: "your attorney",
  guardrail:
    "Organization and education only. Not legal advice. Jurisdiction-specific strategy belongs with your attorney.",
  draftsDescription:
    "Identify the issue, gather the sources, then prepare questions and requests for your attorney. Nothing here is filed, served, or approved.",
  draftsEmpty:
    "Start with the questions you would put to your attorney, or a request for the records you still do not have. Every draft keeps its citations attached.",
  questionsEyebrow: "4 · alternative explanations & questions for your attorney",
  questionsButton: "Draft questions for counsel",
  questionsNote:
    "Generated material is saved as a draft stamped DRAFT — NOT FILED OR SERVED. Review it with your attorney before using it anywhere.",
  questionDraftType: "Attorney Questions",
  packetReminder:
    "This packet organizes material for you and your attorney. It is not a filing, not legal advice, and not a prediction of any outcome.",
  learningDescription:
    "Ten lessons on reading records, weighing options, and preparing in plain language. Narration and reflections are built in; jurisdiction-specific rules still belong to your attorney.",
  learningFooter:
    "The Learning Lab teaches how to navigate information. It does not provide legal advice or replace your attorney in this matter.",
  overviewLine: "Held together, so your attorney can act on it.",
  dialogDescription:
    "Drafts organize the questions and requests your attorney can act on. They are never filed, served, or presented as legal documents.",
};

const SELF = {
  key: "self",
  label: "Self-represented",
  reviewer: "your court's self-help center",
  guardrail:
    "Organization and education only. Not legal advice. Confirm every rule and deadline with your court's clerk or self-help center.",
  draftsDescription:
    "Identify the issue, gather the sources, then write your own questions and record requests. Nothing here is filed, served, or approved.",
  draftsEmpty:
    "Start with the questions you want answered at the next hearing, or a request for the records you still do not have. Every draft keeps its citations attached.",
  questionsEyebrow: "4 · alternative explanations & questions to put to the court",
  questionsButton: "Draft questions to ask the court",
  questionsNote:
    "Generated material is saved as a draft stamped DRAFT — NOT FILED OR SERVED. Confirm anything procedural with your court's clerk or self-help center before using it.",
  questionDraftType: "Court Questions",
  packetReminder:
    "This packet organizes material for a parent speaking for themselves. It is not a filing and not legal advice, and it does not tell you what your court requires.",
  learningDescription:
    "Ten lessons on reading records, weighing options, and preparing in plain language, written for a parent who speaks for themselves. Court rules still govern; confirm them with the clerk or self-help center.",
  learningFooter:
    "The Learning Lab teaches how to navigate information. It does not provide legal advice, and court rules still govern what you file and say.",
  overviewLine: "Held together, in language you can act on yourself.",
  dialogDescription:
    "Drafts organize the questions you will raise and the records you still need. They are never filed, served, or presented as legal documents.",
};

const LIMITED = {
  ...COUNSEL,
  key: "limited",
  label: "Limited-scope or standby counsel",
  guardrail:
    "Organization and education only. Not legal advice. Limited-scope counsel may not cover every step; confirm what is covered.",
  questionsNote:
    "Generated material is saved as a draft stamped DRAFT — NOT FILED OR SERVED. Ask your attorney which parts of the case they cover before acting on it.",
  packetReminder:
    "This packet organizes material for you and the parts of the matter your attorney covers. It is not a filing and not legal advice.",
};

const UNCERTAIN = {
  ...SELF,
  key: "uncertain",
  label: "Representation uncertain or changing",
  guardrail:
    "Organization and education only. Not legal advice. Representation may change; confirm your status with the court before relying on any step.",
  questionsEyebrow: "4 · alternative explanations & questions to confirm",
  questionsButton: "Draft questions to confirm",
  questionsNote:
    "Generated material is saved as a draft stamped DRAFT — NOT FILED OR SERVED. Confirm who represents you, and what the court requires, before you use it.",
  packetReminder:
    "This packet organizes material without assuming who will present it. It is not a filing and not legal advice.",
  overviewLine: "Held together, whichever way your representation settles.",
  dialogDescription:
    "Drafts organize your questions and record requests while representation is unsettled. They are never filed, served, or presented as legal documents.",
};

export const getVoice = (workspace) => {
  const state = workspace?.representation || DEFAULT_REPRESENTATION;
  if (state === "Self-represented") return SELF;
  if (state === "Limited-scope or standby counsel") return LIMITED;
  if (state === "Representation uncertain or changing") return UNCERTAIN;
  return COUNSEL;
};