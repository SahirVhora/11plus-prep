import { COURSE_END, FGP36_SESSIONS, MISSIONS, SCHOOL_ROUTES } from "./data.ts";
import type {
  AssessmentEntry,
  Confidence,
  HomeworkEntry,
  JourneyState,
  JourneySubject,
  MissionCompletion,
} from "./types.ts";

export const JOURNEY_STORAGE_KEY = "11plus_grammar_journey_v1";

export function createInitialJourneyState(): JourneyState {
  return {
    version: 1,
    outwardPostcode: "",
    selectedSchoolIds: SCHOOL_ROUTES.map((school) => school.id),
    completedMissions: {},
    homework: [],
    assessments: [],
    notificationsEnabled: false,
  };
}

export function normaliseOutwardPostcode(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 5);
}

export function normaliseJourneyState(value: unknown): JourneyState {
  const fallback = createInitialJourneyState();
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Partial<JourneyState>;

  const subjects: JourneySubject[] = [
    "english",
    "maths",
    "verbal",
    "nonverbal",
  ];
  const isSubject = (subject: unknown): subject is JourneySubject =>
    typeof subject === "string" && subjects.includes(subject as JourneySubject);
  const homework = Array.isArray(candidate.homework)
    ? candidate.homework
        .filter((entry): entry is HomeworkEntry => {
          if (!entry || typeof entry !== "object") return false;
          const item = entry as Partial<HomeworkEntry>;
          return (
            typeof item.id === "string" &&
            typeof item.date === "string" &&
            isSubject(item.subject) &&
            typeof item.book === "string" &&
            typeof item.pages === "string" &&
            typeof item.note === "string" &&
            typeof item.complete === "boolean"
          );
        })
        .slice(0, 500)
    : [];
  const assessments = Array.isArray(candidate.assessments)
    ? candidate.assessments
        .filter((entry): entry is AssessmentEntry => {
          if (!entry || typeof entry !== "object") return false;
          const item = entry as Partial<AssessmentEntry>;
          return (
            typeof item.id === "string" &&
            typeof item.date === "string" &&
            (item.subject === "mixed" || isSubject(item.subject)) &&
            Number.isInteger(item.score) &&
            Number.isInteger(item.total) &&
            typeof item.score === "number" &&
            typeof item.total === "number" &&
            item.total > 0 &&
            item.score >= 0 &&
            item.score <= item.total &&
            typeof item.note === "string"
          );
        })
        .slice(0, 500)
    : [];
  const confidences: Confidence[] = ["easy", "okay", "tricky"];
  const completedMissions =
    candidate.completedMissions &&
    typeof candidate.completedMissions === "object"
      ? Object.fromEntries(
          Object.entries(candidate.completedMissions)
            .filter((entry): entry is [string, MissionCompletion] => {
              const [, completion] = entry;
              return Boolean(
                completion &&
                typeof completion === "object" &&
                typeof (completion as MissionCompletion).completedAt ===
                  "string" &&
                confidences.includes(
                  (completion as MissionCompletion).confidence,
                ),
              );
            })
            .slice(0, 200),
        )
      : {};

  return {
    version: 1,
    outwardPostcode:
      typeof candidate.outwardPostcode === "string"
        ? normaliseOutwardPostcode(candidate.outwardPostcode)
        : "",
    selectedSchoolIds: Array.isArray(candidate.selectedSchoolIds)
      ? [
          ...new Set(
            candidate.selectedSchoolIds.filter(
              (id): id is string =>
                typeof id === "string" &&
                SCHOOL_ROUTES.some((school) => school.id === id),
            ),
          ),
        ]
      : fallback.selectedSchoolIds,
    completedMissions,
    homework,
    assessments,
    notificationsEnabled: candidate.notificationsEnabled === true,
  };
}

function localDate(date: string): Date {
  return new Date(`${date}T12:00:00`);
}

export function getNextSession(now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  return (
    FGP36_SESSIONS.find((session) => localDate(session.date) >= today) ?? null
  );
}

export function getCourseProgress(now = new Date()): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  const completed = FGP36_SESSIONS.filter(
    (session) => localDate(session.date) < today,
  ).length;
  return Math.round((completed / FGP36_SESSIONS.length) * 100);
}

export function getTodayMission(now = new Date()) {
  const localToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    12,
  );
  const dayKey = Math.floor(localToday.getTime() / 86_400_000);
  return MISSIONS[Math.abs(dayKey) % MISSIONS.length];
}

export function getKendrickEligibility(
  outwardPostcode: string,
): "likely-in-area" | "outside-area" | "unknown" {
  const code = normaliseOutwardPostcode(outwardPostcode);
  if (!code) return "unknown";

  const fullDistricts = [
    "RG1",
    "RG7",
    "RG8",
    "RG9",
    "RG10",
    "RG12",
    "RG40",
    "RG41",
    "RG42",
    "RG45",
    "GU46",
    "GU47",
  ];
  if (fullDistricts.includes(code)) return "likely-in-area";

  const sectorRequired = [
    "RG2",
    "RG4",
    "RG5",
    "RG6",
    "RG27",
    "RG30",
    "RG31",
    "GU17",
    "SL6",
  ];
  if (sectorRequired.includes(code)) return "unknown";

  const includedSectors = [
    "RG20",
    "RG26",
    "RG27",
    "RG28",
    "RG29",
    "RG301",
    "RG302",
    "RG303",
    "RG304",
    "RG306",
    "RG314",
    "RG315",
    "RG316",
    "RG317",
    "RG45",
    "RG46",
    "RG47",
    "RG48",
    "RG49",
    "RG53",
    "RG54",
    "RG61",
    "RG63",
    "RG64",
    "RG65",
    "RG66",
    "RG67",
    "RG270",
    "GU170",
    "SL63",
    "SL64",
    "SL65",
    "SL66",
  ];
  if (includedSectors.includes(code)) return "likely-in-area";
  return "outside-area";
}

function escapeIcs(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\n/g, "\\n");
}

function compactDate(date: string): string {
  return date.replaceAll("-", "");
}

export function buildCourseCalendar(): string {
  const events = FGP36_SESSIONS.map((session) => {
    const start = compactDate(session.date);
    return [
      "BEGIN:VEVENT",
      `UID:fgp36-${session.number}@grammar-journey.local`,
      "DTSTAMP:20260901T000000Z",
      `DTSTART:${start}T123000`,
      `DTEND:${start}T150000`,
      `SUMMARY:${escapeIcs(`FGP36 - ${session.label}`)}`,
      "LOCATION:AE Tuition Feltham\\, Bridge House\\, 1a Freddie Mercury Close\\, TW13 5DF",
      `DESCRIPTION:${escapeIcs(`Session ${session.number} of 40. Bring required books and homework diary. Parents join the final 30 minutes.`)}`,
      "BEGIN:VALARM",
      "TRIGGER:-P1D",
      "ACTION:DISPLAY",
      "DESCRIPTION:Pack AE books and homework diary",
      "END:VALARM",
      "END:VEVENT",
    ].join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Grammar Journey//FGP36 2026-27//EN",
    "CALSCALE:GREGORIAN",
    "X-WR-CALNAME:FGP36 - 11+ Journey",
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

export function isCourseComplete(now = new Date()): boolean {
  return now > localDate(COURSE_END);
}
