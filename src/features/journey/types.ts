export type JourneySubject = "english" | "maths" | "verbal" | "nonverbal";

export type Confidence = "easy" | "okay" | "tricky";

export interface CourseSession {
  number: number;
  date: string;
  kind: "lesson" | "assessment" | "mock";
  label: string;
}

export interface Mission {
  id: string;
  subject: JourneySubject;
  title: string;
  eyebrow: string;
  minutes: number;
  introduction: string;
  steps: string[];
  offlineChallenge: string;
  parentPrompt: string;
}

export interface HomeworkEntry {
  id: string;
  date: string;
  subject: JourneySubject;
  book: string;
  pages: string;
  note: string;
  complete: boolean;
}

export interface AssessmentEntry {
  id: string;
  date: string;
  subject: JourneySubject | "mixed";
  score: number;
  total: number;
  note: string;
}

export interface MissionCompletion {
  completedAt: string;
  confidence: Confidence;
}

export interface JourneyState {
  version: 1;
  outwardPostcode: string;
  selectedSchoolIds: string[];
  completedMissions: Record<string, MissionCompletion>;
  homework: HomeworkEntry[];
  assessments: AssessmentEntry[];
  notificationsEnabled: boolean;
}

export interface SchoolRoute {
  id: string;
  name: string;
  location: string;
  route: string;
  subjects: JourneySubject[];
  status: "primary" | "aspirational" | "conditional" | "explore";
  note: string;
  sourceUrl: string;
  sourceLabel: string;
}
