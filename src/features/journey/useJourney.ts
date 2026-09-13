import { useCallback, useEffect, useState } from "react";
import {
  createInitialJourneyState,
  JOURNEY_STORAGE_KEY,
  normaliseJourneyState,
} from "./model";
import type {
  AssessmentEntry,
  Confidence,
  HomeworkEntry,
  JourneyState,
} from "./types";

function readJourney(): JourneyState {
  try {
    const raw = window.localStorage.getItem(JOURNEY_STORAGE_KEY);
    return raw
      ? normaliseJourneyState(JSON.parse(raw))
      : createInitialJourneyState();
  } catch {
    return createInitialJourneyState();
  }
}

function makeId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useJourney() {
  const [journey, setJourney] = useState<JourneyState>(readJourney);

  useEffect(() => {
    try {
      window.localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(journey));
    } catch {
      // Private browsing and full storage must never break the learning flow.
    }
  }, [journey]);

  const updateProfile = useCallback((outwardPostcode: string) => {
    setJourney((current) =>
      normaliseJourneyState({ ...current, outwardPostcode }),
    );
  }, []);

  const toggleSchool = useCallback((schoolId: string) => {
    setJourney((current) => ({
      ...current,
      selectedSchoolIds: current.selectedSchoolIds.includes(schoolId)
        ? current.selectedSchoolIds.filter((id) => id !== schoolId)
        : [...current.selectedSchoolIds, schoolId],
    }));
  }, []);

  const completeMission = useCallback(
    (missionId: string, confidence: Confidence) => {
      setJourney((current) => ({
        ...current,
        completedMissions: {
          ...current.completedMissions,
          [missionId]: { completedAt: new Date().toISOString(), confidence },
        },
      }));
    },
    [],
  );

  const addHomework = useCallback((entry: Omit<HomeworkEntry, "id">) => {
    setJourney((current) => ({
      ...current,
      homework: [{ ...entry, id: makeId("homework") }, ...current.homework],
    }));
  }, []);

  const toggleHomework = useCallback((id: string) => {
    setJourney((current) => ({
      ...current,
      homework: current.homework.map((entry) =>
        entry.id === id ? { ...entry, complete: !entry.complete } : entry,
      ),
    }));
  }, []);

  const removeHomework = useCallback((id: string) => {
    setJourney((current) => ({
      ...current,
      homework: current.homework.filter((entry) => entry.id !== id),
    }));
  }, []);

  const addAssessment = useCallback((entry: Omit<AssessmentEntry, "id">) => {
    setJourney((current) => ({
      ...current,
      assessments: [
        { ...entry, id: makeId("assessment") },
        ...current.assessments,
      ],
    }));
  }, []);

  const removeAssessment = useCallback((id: string) => {
    setJourney((current) => ({
      ...current,
      assessments: current.assessments.filter((entry) => entry.id !== id),
    }));
  }, []);

  const setNotificationsEnabled = useCallback((enabled: boolean) => {
    setJourney((current) => ({ ...current, notificationsEnabled: enabled }));
  }, []);

  const importJourney = useCallback((raw: string) => {
    const parsed = JSON.parse(raw) as unknown;
    const next = normaliseJourneyState(parsed);
    setJourney(next);
    return next;
  }, []);

  const resetJourney = useCallback(
    () => setJourney(createInitialJourneyState()),
    [],
  );

  return {
    journey,
    updateProfile,
    toggleSchool,
    completeMission,
    addHomework,
    toggleHomework,
    removeHomework,
    addAssessment,
    removeAssessment,
    setNotificationsEnabled,
    importJourney,
    resetJourney,
  };
}
