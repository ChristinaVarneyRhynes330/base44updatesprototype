// Fictional demonstration content. Shown until the seeded Demo Case is connected.
// All names, agencies and case numbers are invented for illustration.

export const DEMO_CASE = {
  title: "Demo Case: Disputed Visitation & Service Plan",
  case_number: "24-DEP-01873",
  jurisdiction: "Fictional County · Dependency Division (demo)",
  status: "Active",
};

export const DEMO_RECORDS = [
  {
    key: "r1",
    title: "Meeting note · May 6",
    category: "Agency Report",
    source_author: "D. Hale, Agency Caseworker",
    event_date: "2026-05-06",
    documented_date: "2026-05-06",
    verification_status: "discrepancy",
    pages: [
      "CONTACT NOTE — FAMILY SERVICES\nCase: 24-DEP-01873\nAuthor: D. Hale, Caseworker\nDate of contact: May 6, 2026\n\nI met with the mother at the agency office. The meeting took place on May 6 at 10:15 a.m. and lasted approximately forty minutes. The mother was advised of the service plan requirements for the coming month.\n\nMother reports that transportation is her primary barrier to attendance. I advised her that bus passes are available on request.",
      "VISITATION\n\nThe mother did not attend the scheduled visitation on May 4, 2026. The visit was scheduled for 3:00 p.m. and the mother was not present when the visit began. The visit was cancelled.\n\nNo documentation was provided to this worker explaining the absence.\n\nNext review: May 27, 2026.",
    ],
  },
  {
    key: "r2",
    title: "Case Summary · May 8",
    category: "Agency Report",
    source_author: "D. Hale, Agency Caseworker",
    event_date: "2026-05-08",
    documented_date: "2026-05-12",
    verification_status: "discrepancy",
    pages: [
      "MONTHLY CASE SUMMARY — MAY 2026\nPrepared: May 12, 2026\nPeriod covered: May 1 – May 31, 2026\n\nSummary of contacts: The worker met with the mother on May 8, 2026, to review the service plan. The meeting occurred at the agency office.\n\nService plan status: Mother has not yet enrolled in the parenting education component. Referral was made on April 28.",
      "COMPLIANCE\n\nMother missed one scheduled visitation during the period. The missed visit is documented in the May 6 contact note.\n\nRecommendation: Continue services. No change to the current plan is recommended at this time.",
    ],
  },
  {
    key: "r3",
    title: "Parent Text Confirmation · May 5",
    category: "Text Message",
    source_author: "Bright Path Visitation (provider)",
    event_date: "2026-05-04",
    documented_date: "2026-05-04",
    verification_status: "verified",
    pages: [
      "SMS THREAD — PRESERVED FROM PARENT'S PHONE\nContact: Bright Path Visitation (provider)\n\nMay 4, 2026 · 9:12 AM\nProvider: \"Hi — we need to move tomorrow's visit. The supervisor is out. Can you do Thursday instead?\"\nParent: \"Thursday the 7th works. Please confirm in writing.\"\nProvider: \"Confirmed — Thursday May 7 at 3:00 PM.\"",
    ],
  },
  {
    key: "r4",
    title: "Court Order · Case Plan Requirements",
    category: "Court Order",
    source_author: "Dependency Division (fictional)",
    event_date: "2026-04-22",
    documented_date: "2026-04-22",
    verification_status: "verified",
    pages: [
      "ORDER ON SERVICE PLAN — DEPENDENCY DIVISION\nCase No. 24-DEP-01873\nEntered: April 22, 2026\n\n1. The mother shall participate in parenting education, consisting of not fewer than eight sessions.\n2. The mother shall submit to random drug testing no less than twice per month.\n3. Visitation shall occur a minimum of two times per week, supervised, at a provider approved by the agency.",
      "4. The agency shall provide written notice of any change to the visitation schedule no less than twenty-four hours in advance, except in an emergency.\n5. Any party may request a review hearing upon written motion.\n\nSO ORDERED.",
    ],
  },
];

export const DEMO_CITATIONS = [
  {
    key: "c1",
    record_key: "r1",
    page_number: 1,
    exact_quote: "The meeting took place on May 6 at 10:15 a.m.",
    epistemic_type: "Observation",
    linked_issue_key: "i1",
  },
  {
    key: "c2",
    record_key: "r2",
    page_number: 1,
    exact_quote: "The worker met with the mother on May 8, 2026, to review the service plan.",
    epistemic_type: "Observation",
    linked_issue_key: "i1",
  },
  {
    key: "c3",
    record_key: "r3",
    page_number: 1,
    exact_quote: "Confirmed — Thursday May 7 at 3:00 PM.",
    epistemic_type: "Observation",
    linked_issue_key: "i1",
  },
  {
    key: "c4",
    record_key: "r1",
    page_number: 2,
    exact_quote: "The mother did not attend the scheduled visitation on May 4, 2026.",
    epistemic_type: "Allegation",
    linked_issue_key: "i1",
  },
  {
    key: "c5",
    record_key: "r4",
    page_number: 1,
    exact_quote:
      "Visitation shall occur a minimum of two times per week, supervised, at a provider approved by the agency.",
    epistemic_type: "Court Finding",
    linked_issue_key: "i1",
  },
  {
    key: "c6",
    record_key: "r4",
    page_number: 2,
    exact_quote:
      "The agency shall provide written notice of any change to the visitation schedule no less than twenty-four hours in advance",
    epistemic_type: "Court Finding",
    linked_issue_key: "i1",
  },
];

export const DEMO_TIMELINE = [
  {
    key: "t1",
    title: "Court order on service plan entered",
    event_date: "2026-04-22",
    documented_date: "2026-04-22",
    description:
      "Order sets parenting education, drug testing, and a minimum of two supervised visits per week.",
    discrepancy_flag: false,
    linked_record_keys: ["r4"],
  },
  {
    key: "t2",
    title: "Provider reschedules May 5 visit",
    event_date: "2026-05-04",
    documented_date: "2026-05-04",
    description:
      "Provider texts to move the following day's visit; parent replies and provider confirms Thursday May 7 at 3:00 PM.",
    discrepancy_flag: false,
    linked_record_keys: ["r3"],
  },
  {
    key: "t3",
    title: "Visit reported as missed",
    event_date: "2026-05-04",
    documented_date: "2026-05-06",
    description:
      "Contact note states the mother did not attend the May 4 visit. The note was written two days later.",
    discrepancy_flag: true,
    linked_record_keys: ["r1", "r3"],
  },
  {
    key: "t4",
    title: "Agency meeting (dates differ across records)",
    event_date: "2026-05-06",
    documented_date: "2026-05-12",
    description:
      "Contact note records the meeting on May 6. The monthly summary records the same meeting on May 8.",
    discrepancy_flag: true,
    linked_record_keys: ["r1", "r2"],
  },
  {
    key: "t5",
    title: "Monthly case summary prepared",
    event_date: "2026-05-12",
    documented_date: "2026-05-12",
    description: "Summary recommends continuing services with no change to the plan.",
    discrepancy_flag: false,
    linked_record_keys: ["r2"],
  },
];

export const DEMO_ISSUE = {
  key: "i1",
  title: "Disputed Visitation & Meeting Date Record",
  summary:
    "Two agency records place the same caseworker meeting on different dates, and one record characterizes a rescheduled visit as a missed visit. The records have not been reconciled.",
  what_agrees:
    "Both agency records agree that a caseworker meeting took place at the agency office in early May and that the service plan was reviewed.",
  what_contradicts:
    "Record 1 dates the meeting May 6; Record 2 dates it May 8. Record 1 states the May 4 visit was missed, while the provider text shows the visit was moved to May 7 by the provider.",
  missing_records_needed:
    "Provider attendance log for May 4–7, the supervisor's scheduling notice, and any agency record of the May 7 visit.",
  alternative_explanations:
    "The meeting may have been held twice. The summary may have been drafted from memory after the fact. The visit may have been recorded as missed before the reschedule was entered.",
  status: "Needs Records",
  linked_citation_keys: ["c1", "c2", "c3", "c4", "c5"],
};

export const DEMO_TASKS = [
  {
    key: "a1",
    title: "Request provider attendance log for May 4–7",
    stage: "Immediate Filing",
    due_date: "2026-05-20",
    completed: false,
    linked_issue_key: "i1",
  },
  {
    key: "a2",
    title: "Add provider text thread to evidence library",
    stage: "Record Comparison",
    due_date: "2026-05-18",
    completed: true,
    linked_issue_key: "i1",
  },
  {
    key: "a3",
    title: "Prepare three questions about the meeting date for counsel",
    stage: "Hearing Preparation",
    due_date: "2026-05-26",
    completed: false,
    linked_issue_key: "i1",
  },
  {
    key: "a4",
    title: "Log May 7 visit confirmation on the timeline",
    stage: "Timeline Entry",
    due_date: "2026-05-19",
    completed: false,
    linked_issue_key: "i1",
  },
  {
    key: "a5",
    title: "Archive April 22 service plan order",
    stage: "Reference Archive",
    due_date: "2026-05-15",
    completed: true,
    linked_issue_key: null,
  },
];

export const DEMO_DRAFT = {
  key: "d1",
  title: "Questions for counsel — meeting date and missed visit",
  draft_type: "Attorney Questions",
  status: "DRAFT - NOT FILED",
  content:
    "DRAFT — NOT FILED OR SERVED\n\nPurpose: organize questions about two records that describe the same events differently.\n\n1. The May 6 contact note says the meeting took place May 6 [Meeting note · p. 1]. The May summary says the meeting took place May 8 [Case Summary · p. 2]. Is it possible both are accurate?\n\n2. The contact note states the May 4 visit was missed [Meeting note · p. 2]. The provider text confirms the visit moved to May 7 [Parent Text · p. 1]. Does the order require written notice of that change? [Court Order · p. 2]\n\n3. What record would resolve whether the agency recorded the May 7 visit?",
  linked_citation_keys: ["c1", "c2", "c3", "c4", "c6"],
};