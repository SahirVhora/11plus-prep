import type { Question } from '../data/metadata';

export function analyseScore(percentage: number): {
  label: string;
  color: string;
  emoji: string;
} {
  if (percentage >= 80) {
    return { label: "Excellent! Grammar school ready", color: 'text-emerald-600', emoji: '🎉' };
  } else if (percentage >= 60) {
    return { label: "Good progress — keep practising!", color: 'text-amber-600', emoji: '👍' };
  } else {
    return { label: "More practice needed — you've got this!", color: 'text-rose-600', emoji: '💪' };
  }
}

export function getTopicBreakdown(
  questions: Question[],
  answers: Record<string, string>
): Array<{ topic: string; subject: string; correct: number; total: number; percentage: number }> {
  const map: Record<string, { topic: string; subject: string; correct: number; total: number }> = {};

  for (const q of questions) {
    const key = `${q.subject}__${q.topic}`;
    if (!map[key]) map[key] = { topic: q.topic, subject: q.subject, correct: 0, total: 0 };
    map[key].total++;
    if ((answers[q.id] || '').toUpperCase() === q.answer.toUpperCase()) {
      map[key].correct++;
    }
  }

  return Object.values(map)
    .map((e) => ({ ...e, percentage: Math.round((e.correct / e.total) * 100) }))
    .sort((a, b) => a.percentage - b.percentage);
}

export function getSubjectBreakdown(
  questions: Question[],
  answers: Record<string, string>
): Array<{ subject: string; correct: number; total: number; percentage: number }> {
  const map: Record<string, { subject: string; correct: number; total: number }> = {};

  for (const q of questions) {
    if (!map[q.subject]) map[q.subject] = { subject: q.subject, correct: 0, total: 0 };
    map[q.subject].total++;
    if ((answers[q.id] || '').toUpperCase() === q.answer.toUpperCase()) {
      map[q.subject].correct++;
    }
  }

  return Object.values(map).map((e) => ({
    ...e,
    percentage: Math.round((e.correct / e.total) * 100),
  }));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}
