import type { CourseSession, Mission, SchoolRoute } from "./types.ts";

export const COURSE_START = "2026-09-06";
export const COURSE_END = "2027-08-29";

const lessonDates = [
  "2026-09-06",
  "2026-09-13",
  "2026-09-20",
  "2026-09-27",
  "2026-10-04",
  "2026-10-11",
  "2026-10-18",
  "2026-11-01",
  "2026-11-08",
  "2026-11-15",
  "2026-11-22",
  "2026-11-29",
  "2026-12-06",
  "2026-12-13",
  "2026-12-20",
  "2027-01-10",
  "2027-01-17",
  "2027-01-24",
  "2027-01-31",
  "2027-02-07",
  "2027-02-21",
  "2027-02-28",
  "2027-03-07",
  "2027-03-14",
  "2027-03-21",
  "2027-04-11",
  "2027-04-18",
  "2027-04-25",
  "2027-05-02",
  "2027-05-09",
  "2027-05-16",
  "2027-05-23",
  "2027-06-06",
  "2027-06-13",
  "2027-06-20",
  "2027-06-27",
  "2027-07-04",
  "2027-07-11",
  "2027-08-22",
  "2027-08-29",
];

export const FGP36_SESSIONS: CourseSession[] = lessonDates.map(
  (date, index) => ({
    number: index + 1,
    date,
    kind: index === 0 ? "assessment" : "lesson",
    label:
      index === 0
        ? "Baseline assessment"
        : index === 24
          ? "Interim English assessment"
          : "FGP36 lesson",
  }),
);

export const COURSE_MILESTONES = [
  {
    date: "2026-09-06",
    title: "Baseline assessment",
    detail: "No preparation required. Use the report as the starting point.",
  },
  {
    date: "2026-12-20",
    title: "Autumn checkpoint",
    detail: "Review habits, confidence and recurring errors - not just scores.",
  },
  {
    date: "2027-03-21",
    title: "Interim English assessment",
    detail: "Turn the result into a short English priority list.",
  },
  {
    date: "2027-05-28",
    title: "AE mock window",
    detail:
      "VR, NVR, technical English and maths. Exact FGP36 arrangements to be confirmed by AE.",
  },
  {
    date: "2027-07-04",
    title: "English mock period",
    detail: "AE will confirm the additional session and follow-up.",
  },
  {
    date: "2027-08-29",
    title: "Final AE session",
    detail: "Confidence, pacing and recovery - no last-minute overload.",
  },
] as const;

export const SCHOOL_ROUTES: SchoolRoute[] = [
  {
    id: "slough",
    name: "Slough Consortium",
    location: "Slough",
    route: "Quest Assessment - two mixed papers",
    subjects: ["english", "maths", "verbal", "nonverbal"],
    status: "primary",
    note: "Confirmed Quest provider for the September 2027 test. Eligibility and each school's oversubscription rules are separate checks.",
    sourceUrl:
      "https://www.herschel.slough.sch.uk/admissions/year-7-admissions-2028/",
    sourceLabel: "Official 2028 route",
  },
  {
    id: "tiffin-girls",
    name: "The Tiffin Girls' School",
    location: "Kingston",
    route: "School selection tests - English and maths",
    subjects: ["english", "maths"],
    status: "aspirational",
    note: "Current policy prioritises its designated area. The final 2028 policy and dates must be checked when published.",
    sourceUrl: "https://www.tiffingirls.org/admissions/year-7/",
    sourceLabel: "Official admissions page",
  },
  {
    id: "kendrick",
    name: "Kendrick School",
    location: "Reading",
    route: "School selection test - current format covers all four subjects",
    subjects: ["english", "maths", "verbal", "nonverbal"],
    status: "conditional",
    note: "Only realistic when the permanent home postcode meets the designated-area rules. The 2028 policy is not yet final.",
    sourceUrl:
      "https://www.kendrick.reading.sch.uk/page/?pid=88&title=Designated+Area",
    sourceLabel: "Official designated area",
  },
  {
    id: "sutton",
    name: "Nonsuch / Wallington Girls",
    location: "Sutton",
    route: "Sutton SET and school-specific second stage",
    subjects: ["english", "maths"],
    status: "explore",
    note: "Keep as an option while checking travel, final 2028 criteria and the second-stage format.",
    sourceUrl: "https://www.nonsuchschool.org/page/?pid=19",
    sourceLabel: "Official admissions page",
  },
];

export const MISSIONS: Mission[] = [
  {
    id: "maths-number-sense",
    subject: "maths",
    eyebrow: "Number detective",
    title: "Build a number three ways",
    minutes: 8,
    introduction:
      "Flexible number thinking makes difficult calculations feel much smaller.",
    steps: [
      "Choose any three-digit number.",
      "Partition it in the usual hundreds, tens and ones.",
      "Find two different ways to partition the same number.",
    ],
    offlineChallenge:
      "Explain your cleverest partition to someone without writing it down.",
    parentPrompt:
      "Ask: Which version would help you calculate most quickly, and why?",
  },
  {
    id: "english-context-clues",
    subject: "english",
    eyebrow: "Word explorer",
    title: "Hunt for a hidden meaning",
    minutes: 8,
    introduction:
      "Strong readers use the words around an unfamiliar word as clues.",
    steps: [
      "Open the book you are currently reading.",
      "Find one word that is interesting or unfamiliar.",
      "Read the whole sentence and predict its meaning before checking.",
    ],
    offlineChallenge: "Use the word in a completely new sentence.",
    parentPrompt: "Ask which nearby words gave the strongest clue.",
  },
  {
    id: "verbal-odd-one-out",
    subject: "verbal",
    eyebrow: "Pattern breaker",
    title: "Defend the odd one out",
    minutes: 7,
    introduction:
      "In verbal reasoning, the explanation matters as much as the choice.",
    steps: [
      "Choose four household objects.",
      "Invent a rule that groups three of them.",
      "Name the odd one out and explain the rule precisely.",
    ],
    offlineChallenge: "Can someone find a different valid odd-one-out rule?",
    parentPrompt:
      "Praise a clear rule even when it is different from the one you expected.",
  },
  {
    id: "nonverbal-rotation",
    subject: "nonverbal",
    eyebrow: "Shape shifter",
    title: "Turn it in your mind",
    minutes: 7,
    introduction:
      "Rotation means a shape turns but keeps every side and corner.",
    steps: [
      "Draw an uneven arrow or L-shape on a small piece of paper.",
      "Turn the paper a quarter turn clockwise.",
      "Hide the paper and draw what the next quarter turn would look like.",
    ],
    offlineChallenge:
      "Check by turning the original paper. Correct the drawing if needed.",
    parentPrompt:
      "Ask what stayed the same and what changed during the rotation.",
  },
  {
    id: "maths-fractions",
    subject: "maths",
    eyebrow: "Fraction chef",
    title: "Make equivalent fractions",
    minutes: 9,
    introduction:
      "Equivalent fractions name the same amount using different-sized pieces.",
    steps: [
      "Draw a rectangle and shade one half.",
      "Split every section into two equal parts.",
      "Write the two fractions that now describe the same shaded amount.",
    ],
    offlineChallenge: "Find two more fractions equivalent to one half.",
    parentPrompt:
      "Ask why both numerator and denominator must change together.",
  },
  {
    id: "english-inference",
    subject: "english",
    eyebrow: "Evidence hunter",
    title: "Read between the lines",
    minutes: 9,
    introduction:
      "Inference combines a clue in the text with something the reader already knows.",
    steps: [
      "Read one paragraph from a story.",
      "Describe how a character probably feels.",
      "Point to the exact words that support your idea.",
    ],
    offlineChallenge:
      "Find a second clue that supports or challenges your answer.",
    parentPrompt: "Use the phrase: What is your evidence?",
  },
  {
    id: "verbal-synonym-ladder",
    subject: "verbal",
    eyebrow: "Vocabulary climber",
    title: "Climb the synonym ladder",
    minutes: 8,
    introduction: "Precise vocabulary helps in English and verbal reasoning.",
    steps: [
      "Start with the word happy.",
      "Write three similar words with increasing strength.",
      "Use the strongest word in a sentence.",
    ],
    offlineChallenge:
      "Build another ladder starting with said, cold or walked.",
    parentPrompt:
      "Discuss how similar words can still create different pictures.",
  },
  {
    id: "nonverbal-symmetry",
    subject: "nonverbal",
    eyebrow: "Mirror maker",
    title: "Complete the reflection",
    minutes: 8,
    introduction:
      "A reflection flips every point the same distance across a mirror line.",
    steps: [
      "Fold a square piece of paper in half.",
      "Draw half a simple shape touching the fold.",
      "Predict the full shape, then cut or trace to check.",
    ],
    offlineChallenge: "Try again with a diagonal fold.",
    parentPrompt: "Ask which points must touch the mirror line.",
  },
  {
    id: "maths-estimation",
    subject: "maths",
    eyebrow: "Answer checker",
    title: "Estimate before calculating",
    minutes: 7,
    introduction:
      "An estimate catches impossible answers before they cost a mark.",
    steps: [
      "Choose two prices from a receipt or menu.",
      "Round each to a friendly whole number.",
      "Estimate the total, then calculate the exact answer.",
    ],
    offlineChallenge:
      "Decide whether the exact answer should be above or below the estimate.",
    parentPrompt: "Ask how the estimate helped check the calculation.",
  },
  {
    id: "english-summary",
    subject: "english",
    eyebrow: "Meaning maker",
    title: "Shrink a paragraph",
    minutes: 8,
    introduction:
      "A good summary keeps the central idea and removes supporting detail.",
    steps: [
      "Read one paragraph of non-fiction.",
      "Say what it is mostly about in one sentence.",
      "Remove any detail that is interesting but not essential.",
    ],
    offlineChallenge: "Give the paragraph a five-word headline.",
    parentPrompt: "Ask what was deliberately left out and why.",
  },
  {
    id: "verbal-code",
    subject: "verbal",
    eyebrow: "Code cracker",
    title: "Invent a letter code",
    minutes: 9,
    introduction:
      "Reliable code solving means testing the same rule on every letter.",
    steps: [
      "Choose a three-letter word.",
      "Move every letter forward by two places.",
      "Give the code to someone else to solve.",
    ],
    offlineChallenge:
      "Try a code that moves backwards or alternates directions.",
    parentPrompt: "Ask for the rule to be stated before solving.",
  },
  {
    id: "nonverbal-series",
    subject: "nonverbal",
    eyebrow: "Sequence spotter",
    title: "Continue a shape story",
    minutes: 8,
    introduction:
      "A shape series may change position, shading, number or direction.",
    steps: [
      "Draw three boxes in a row.",
      "Create a shape that changes by one clear rule.",
      "Draw two more boxes that continue the pattern.",
    ],
    offlineChallenge:
      "Ask someone to describe the rule without seeing your answer.",
    parentPrompt:
      "Check that the rule works at every step, not only the final one.",
  },
];

export const SUBJECT_LABELS = {
  english: "English",
  maths: "Maths",
  verbal: "Verbal reasoning",
  nonverbal: "Non-verbal reasoning",
} as const;
