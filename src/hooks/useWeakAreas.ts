import { useState, useCallback } from 'react';
import type { Question } from '../data/metadata';

export interface WeakAreaEntry {
  subject: string;
  topic: string;
  attempts: number;
  correct: number;
  lastSeen: string;
}

export type WeakAreaMap = Record<string, WeakAreaEntry>;

const STORAGE_KEY = '11plus_weak_areas';

function load(): WeakAreaMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(map: WeakAreaMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export function useWeakAreas() {
  const [weakAreas, setWeakAreas] = useState<WeakAreaMap>(load);

  const updateFromResults = useCallback((
    questions: Question[],
    answers: Record<string, string>
  ) => {
    const updated = load();
    for (const q of questions) {
      const key = `${q.subject}__${q.topic}`;
      const existing = updated[key] || { subject: q.subject, topic: q.topic, attempts: 0, correct: 0, lastSeen: '' };
      const isCorrect = answers[q.id]?.toUpperCase() === q.answer.toUpperCase();
      updated[key] = {
        ...existing,
        attempts: existing.attempts + 1,
        correct: existing.correct + (isCorrect ? 1 : 0),
        lastSeen: new Date().toISOString(),
      };
    }
    save(updated);
    setWeakAreas({ ...updated });
  }, []);

  const getWeakTopics = useCallback((threshold = 0.6): WeakAreaEntry[] => {
    return Object.values(weakAreas).filter(
      (e) => e.attempts >= 3 && e.correct / e.attempts < threshold
    ).sort((a, b) => (a.correct / a.attempts) - (b.correct / b.attempts));
  }, [weakAreas]);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setWeakAreas({});
  }, []);

  const getScore = useCallback((subject: string, topic: string): number | null => {
    const key = `${subject}__${topic}`;
    const entry = weakAreas[key];
    if (!entry || entry.attempts === 0) return null;
    return entry.correct / entry.attempts;
  }, [weakAreas]);

  return { weakAreas, updateFromResults, getWeakTopics, clearHistory, getScore };
}
