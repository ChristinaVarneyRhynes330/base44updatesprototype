export const LEARNING_MODULES = [
  {
    number: 1,
    title: "Understanding Your Objectives",
    subtitle: "Know what you are actually trying to accomplish.",
    minutes: 7,
    sections: [
      {
        heading: "Start with the outcome, not the argument",
        body: "Before you respond to a report or prepare for a hearing, write down what you want the next thirty days to look like. A clear objective sounds like: \"I want the visit schedule in writing\" or \"I want to understand why a service was added.\" It does not sound like \"I want them to admit they were wrong.\" The second one may be true and still be unhelpful in the room.",
      },
      {
        heading: "Separate the outcome from the emotion",
        body: "Both matter, and they are different tasks. The emotion needs somewhere to go; the outcome needs a plan. This platform is for the second. Write your objective in one sentence, then check it: could a person who disagrees with you still understand it? If yes, it is specific enough to work with.",
      },
      {
        heading: "Objectives change as the case changes",
        body: "An objective set before a hearing may be wrong afterwards. That is not failure; it is information. Return to this lesson when something shifts and rewrite the sentence.",
      },
    ],
    example: {
      title: "Example",
      body: "A parent writes \"I want the missed visit removed from the report.\" Asked what outcome that serves, she rewrites it: \"I want the record to show the visit was rescheduled by the provider, and I want written notice of schedule changes going forward.\" The second version points at specific records and a specific request.",
    },
    knowledgeCheck: {
      question: "Which of these is the most workable objective?",
      options: [
        "I want the caseworker to admit she misrepresented me.",
        "I want written confirmation of the current visitation schedule.",
        "I want the whole case dismissed immediately.",
      ],
      answerIndex: 1,
      explanation:
        "The second objective names something that can be requested, verified, and tracked. The others may be wishes, but they do not tell you what to do next.",
    },
    reflectionPrompt: "In one sentence, what do you want the next thirty days of this case to look like?",
  },
  {
    number: 2,
    title: "Interpreting Legal & Child Welfare Terminology",
    subtitle: "The words decide what question you are answering.",
    minutes: 8,
    sections: [
      {
        heading: "A word is a category, not a verdict",
        body: "\"Substantiated,\" \"indicated,\" \"unfounded,\" \"adjudicated,\" \"dependency,\" \"disposition\" — each of these belongs to a system with its own definitions, and the definitions differ by jurisdiction. When you meet a new term, your first question is not \"is that bad?\" It is \"what does this word mean here, and who decided?\"",
      },
      {
        heading: "Ask three questions about any term",
        body: "First: what does it describe — a fact, a decision, or a category? Second: who is allowed to use it (a caseworker, a court, a provider)? Third: what does it change in your case, if anything? A term that changes nothing on paper can still change how people treat you, and that is worth naming.",
      },
      {
        heading: "Where to check",
        body: "Your own court orders, the agency's written definitions, and your jurisdiction's published rules are the places to look. This lesson teaches you how to look; it does not tell you what your jurisdiction requires. That answer belongs to qualified counsel, your court's self-help resources, and the official rules.",
      },
    ],
    example: {
      title: "Example",
      body: "A report says a service was \"recommended.\" The parent assumed it was required and completed eight sessions before asking. Reading the order, she finds the service was listed as available, not mandated. The word mattered, and nobody explained it.",
    },
    knowledgeCheck: {
      question: "What is the first question to ask about an unfamiliar legal term?",
      options: [
        "Does this term mean I am in trouble?",
        "What does this term mean in this jurisdiction, and who applies it?",
        "Can I ignore it if my caseworker used it casually?",
      ],
      answerIndex: 1,
      explanation:
        "Meaning and authority come first. Without them you cannot tell whether the word changes an obligation or only describes a category.",
    },
    reflectionPrompt: "Which term in your case do you still not fully understand, and where could you check its definition?",
  },
  {
    number: 3,
    title: "Allegations vs. Observations vs. Court Findings",
    subtitle: "What was said, what was seen, and what was decided.",
    minutes: 9,
    sections: [
      {
        heading: "Three different kinds of statement",
        body: "An allegation is a claim that something happened. An observation is what a person says they saw or did. A court finding is a decision made by a judge after a process. They carry different weight and different remedies. A report can contain all three on the same page.",
      },
      {
        heading: "Why the difference is your leverage",
        body: "If you respond to an allegation as though it were a finding, you argue with the wrong thing. If you respond to a finding as though it were an allegation, you may miss the deadline to challenge it. Labeling the statement tells you what kind of response is even possible.",
      },
      {
        heading: "The quieter categories",
        body: "Professional opinion and inference are easy to mistake for observation. \"The mother appeared disengaged\" is an interpretation of behavior, not a description of an event. \"She will likely disengage again\" is a prediction. Naming them accurately is not nitpicking; it is how you locate what is actually verifiable.",
      },
    ],
    example: {
      title: "Example",
      body: "\"The mother did not attend the scheduled visitation on May 4\" reads like an observation, but the note was written two days later by someone who was not present. On the record it is an allegation recorded in an official document. The provider's text message is an observation from the person who arranged the visit.",
    },
    knowledgeCheck: {
      question: "\"The mother appeared uninterested during the meeting\" is best labeled as:",
      options: ["An observation", "A professional opinion or inference", "A court finding"],
      answerIndex: 1,
      explanation:
        "It describes an interpretation of behavior rather than a specific event, and no court has decided anything. That makes it an opinion or an inference.",
    },
    reflectionPrompt: "Find one sentence in your records that reads like fact but is actually opinion. What makes it opinion?",
  },
  {
    number: 4,
    title: "Organizing Deadlines & Contingencies",
    subtitle: "What is due, what depends on what.",
    minutes: 7,
    sections: [
      {
        heading: "A deadline is a date plus an action",
        body: "Write both. \"May 27\" is not a deadline; \"May 27 — file the written request for the provider log\" is. If you cannot name the action, you do not yet have a task; you have a date.",
      },
      {
        heading: "Contingencies are the honest part of planning",
        body: "Some steps only exist if something else happens first: if the record request is refused, then find out whether a subpoena is available; if the hearing is continued, then the packet gets revised. Write those as branches rather than keeping them in your head. A plan with branches survives contact with a court calendar.",
      },
      {
        heading: "Use the Tasks & Follow-Up module",
        body: "Tasks are grouped by stage so you can see whether you are preparing, comparing, or archiving. Review the list before every hearing and after every new document.",
      },
    ],
    example: {
      title: "Example",
      body: "A parent's list reads: visit Friday, hearing June 3. Rewritten: request the attendance log by May 20; confirm the visit time in writing by Thursday; prepare three questions to raise by May 29; bring the packet to the June 3 hearing. Same facts, different readiness.",
    },
    knowledgeCheck: {
      question: "Which is a well-formed task?",
      options: [
        "Hearing on June 3",
        "Prepare the questions I want to ask about the May 4 visit, by May 29",
        "Think about the case more",
      ],
      answerIndex: 1,
      explanation:
        "It names a specific action with a date. The others are either only a date or not an action at all.",
    },
    reflectionPrompt: "What is the next real deadline in your case, and what exact action belongs to it?",
  },
  {
    number: 5,
    title: "Investigating Records & Tracing Sources",
    subtitle: "Follow every statement back to where it started.",
    minutes: 9,
    sections: [
      {
        heading: "A statement has a chain",
        body: "When a summary says the mother missed a visit, ask which document that sentence came from. Sometimes the summary is repeating a contact note; sometimes it is repeating another summary. Tracing the chain shows whether something was independently observed or copied forward.",
      },
      {
        heading: "Read for the author and the moment",
        body: "Who wrote this, when, and were they there? A note written two days later by someone who was not present is a different artifact from a text message sent during the appointment. Neither is automatically more true; they are simply different kinds of evidence.",
      },
      {
        heading: "Tag the exact sentence",
        body: "In this platform, tagging keeps the original wording attached to your analysis. Summaries drift. Quotes do not.",
      },
    ],
    example: {
      title: "Example",
      body: "The May summary says a visit was missed and cites the May 6 contact note. The contact note does not cite anything. Tracing the chain shows one source, not two independent confirmations — even though it appears twice in the file.",
    },
    knowledgeCheck: {
      question: "Two documents state the same fact. What should you check before treating them as independent confirmation?",
      options: [
        "Whether they were written in the same month",
        "Whether one simply repeats or cites the other",
        "Whether both are signed by a supervisor",
      ],
      answerIndex: 1,
      explanation:
        "Repetition looks like corroboration but is not. If the second document only repeats the first, you have one source.",
    },
    reflectionPrompt: "Which statement in your records appears in more than one place, and can you trace it to its origin?",
  },
  {
    number: 6,
    title: "Spotting Discrepancies & Missing Context",
    subtitle: "A difference is a question, not a conclusion.",
    minutes: 8,
    sections: [
      {
        heading: "Two kinds of gap",
        body: "A discrepancy is when records disagree — May 6 versus May 8. Missing context is when a record is silent where you expected detail — a visit log with no arrival time, a report with no date of observation. Both deserve attention, and neither proves intent.",
      },
      {
        heading: "Keep the question open",
        body: "There are innocent explanations for most discrepancies: a rescheduled meeting, a second meeting, a typo, a summary drafted from memory. Write the alternative explanations down before you decide which one you believe. Doing this protects your credibility when you are right.",
      },
      {
        heading: "Use the dual-date timeline",
        body: "Date of event and date of documentation are separate columns for a reason. The gap between them often explains the discrepancy.",
      },
    ],
    example: {
      title: "Example",
      body: "A contact note places a meeting on May 6, written May 6. A monthly summary places the same meeting on May 8, written May 12. One possibility is an error in the summary; another is two separate meetings. The provider's text thread may resolve it.",
    },
    knowledgeCheck: {
      question: "What is the safest first response to a discrepancy?",
      options: [
        "Assume the later document is correct",
        "Write down the possible explanations and the records that could resolve it",
        "Ask for the caseworker to be removed",
      ],
      answerIndex: 1,
      explanation:
        "Naming explanations and the missing records keeps the investigation honest and gives you something specific to request.",
    },
    reflectionPrompt: "Describe one discrepancy in your case in neutral language: what record says what, and what would settle it.",
  },
  {
    number: 7,
    title: "Evaluating Risks & Weighing Options",
    subtitle: "Choose with your eyes open.",
    minutes: 9,
    sections: [
      {
        heading: "Every option has a cost",
        body: "Filing a motion may change a schedule. Raising an issue loudly may change a working relationship. Staying quiet may cost time you cannot recover. Write the cost next to each option, including the option of waiting.",
      },
      {
        heading: "Separate the legal from the practical",
        body: "Whether something is permitted is a legal question for counsel or the court. Whether it helps your family this month is a practical one you can reason about. Keep them in different columns so one does not quietly answer the other.",
      },
      {
        heading: "Decide with a record",
        body: "Write down what you decided, when, and why. If the situation changes, you will want to know what you knew at the time. That is also what a well-prepared client sounds like.",
      },
    ],
    example: {
      title: "Example",
      body: "A parent wants to file immediately. The practical cost: the next hearing is in three weeks and the record request is pending. Weighing both, she requests the record first and keeps the filing option ready. That is a decision, not a delay.",
    },
    knowledgeCheck: {
      question: "What does weighing options require you to write down?",
      options: [
        "Only the option you prefer",
        "Each option with its likely cost, including waiting",
        "The outcome you are certain will happen",
      ],
      answerIndex: 1,
      explanation:
        "Options and costs, including inaction, make the decision reviewable later and keep you from pretending there was only one choice.",
    },
    reflectionPrompt: "What are your realistic options right now, and what does each one cost?",
  },
  {
    number: 8,
    title: "Considering Opposing Arguments",
    subtitle: "Understand the other side without adopting it.",
    minutes: 8,
    sections: [
      {
        heading: "Steelman the other account",
        body: "Write the strongest honest version of the account you disagree with. Not a caricature — the version its author would recognize. If you cannot write it, you may not yet understand what you are up against.",
      },
      {
        heading: "Find the shared facts",
        body: "Most disputes share more facts than either side admits. Both agree a visit was scheduled. Both agree a meeting happened. Start there, because shared facts are where agreements get built and where credibility gets earned.",
      },
      {
        heading: "This is not surrender",
        body: "Understanding an argument is not conceding it. It is the difference between answering the actual concern and answering the one you assumed.",
      },
    ],
    example: {
      title: "Example",
      body: "The agency's position may be: notice was given verbally and the visit was missed. The parent's position: notice was a text from the provider, and the visit was moved. Writing both lets the parent ask a precise question about what notice was required and by whom.",
    },
    knowledgeCheck: {
      question: "What makes a steelman useful?",
      options: [
        "It is the version you can argue against most easily",
        "It is the strongest version of the other account, recognizable to its author",
        "It shows the other side is acting in bad faith",
      ],
      answerIndex: 1,
      explanation:
        "Only a fair version tells you what you are actually responding to. A weak version is comfortable and useless.",
    },
    reflectionPrompt: "Write the strongest version of the account you disagree with in your case.",
  },
  {
    number: 9,
    title: "Preparing for Hearings & Communicating Clearly",
    subtitle: "Say less, more precisely.",
    minutes: 9,
    sections: [
      {
        heading: "Build the packet around issues, not feelings",
        body: "Choose the two or three issues you need addressed, attach the exact citations, and write one sentence about the purpose of each. A hearing packet is a map for a short conversation, not a memoir.",
      },
      {
        heading: "Prepare short answers",
        body: "Practice out loud, in one or two sentences: what you are asking for, what record supports it, and what you do not know. The third one matters most. \"I do not have that record; I requested it on May 20\" is a strong answer.",
      },
      {
        heading: "Courtroom mode",
        body: "The live view keeps your packet, pinned exhibits, and a note logger in front of you. Use it to record what was requested, discussed, and ruled, then compare those notes with the written order afterward. What was said and what was entered are not always identical.",
      },
    ],
    example: {
      title: "Example",
      body: "A parent's packet holds two issues, four citations, three questions, and one goal: written notice of schedule changes. In the room she asks her three questions and writes the judge's answer word for word. Afterward she compares it with the order.",
    },
    knowledgeCheck: {
      question: "What belongs in a hearing packet?",
      options: [
        "Every document you have, in case something comes up",
        "The issues, the supporting citations, your priority questions, and the hearing goal",
        "A full narrative of everything that has happened since removal",
      ],
      answerIndex: 1,
      explanation:
        "A small, cited packet you can actually use beats a complete file you cannot navigate while a hearing moves.",
    },
    reflectionPrompt: "What are the two or three issues you actually need addressed at your next hearing?",
  },
  {
    number: 10,
    title: "Reviewing Decisions & Post-Hearing Follow-Up",
    subtitle: "The hearing ends; the record continues.",
    minutes: 8,
    sections: [
      {
        heading: "Compare notes with paper",
        body: "After the hearing, read the written order next to your live notes. Check what was requested, what was discussed, what was ruled, and what actually appears. When those differ, you have a specific, documentable question rather than a general frustration.",
      },
      {
        heading: "Update the case, not just your memory",
        body: "Add the new order as a record. Add its dates to the timeline. Create tasks for the obligations it creates. A case that is not updated becomes a case you have to rebuild.",
      },
      {
        heading: "Keep the correction history",
        body: "If something turns out to be inaccurate, correct it and keep the original entry in the audit log. The history of why you believed something is part of your credibility, not a liability.",
      },
    ],
    example: {
      title: "Example",
      body: "The judge says from the bench that visitation continues at two visits per week. The written order says \"reasonable visitation as arranged by the agency.\" The parent records the difference and asks what the written language means for the schedule.",
    },
    knowledgeCheck: {
      question: "What is the first step after a hearing?",
      options: [
        "Wait for the next hearing",
        "Compare your live notes with the written order and update the case",
        "Post about the outcome",
      ],
      answerIndex: 1,
      explanation:
        "Comparing notes with the written order is what turns an experience into a workable record, and it surfaces differences while they are fresh.",
    },
    reflectionPrompt: "What did the last hearing or meeting change, and what in the workspace still needs updating?",
  },
];

export const getModule = (number) =>
  LEARNING_MODULES.find((module) => module.number === Number(number));

export const moduleNarration = (module) =>
  [
    `Module ${module.number}. ${module.title}. ${module.subtitle}`,
    ...module.sections.map((section) => `${section.heading}. ${section.body}`),
    `${module.example.title}. ${module.example.body}`,
  ].join("\n\n");