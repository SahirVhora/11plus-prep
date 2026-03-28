import type { Question, Subject, Difficulty } from '../data/metadata';

export function sampleQuestions(
  allQuestions: Question[],
  count: number,
  difficulty?: Difficulty | 'mixed',
  subject?: Subject | 'mixed',
  targetTopic?: string
): Question[] {
  let pool = [...allQuestions];

  if (subject && subject !== 'mixed') {
    pool = pool.filter((q) => q.subject === subject);
  }

  if (targetTopic) {
    pool = pool.filter((q) => q.topic === targetTopic);
  }

  if (difficulty && difficulty !== 'mixed') {
    pool = pool.filter((q) => q.difficulty === difficulty);
    if (pool.length < count) {
      // fallback: include adjacent difficulties
      pool = allQuestions.filter(
        (q) =>
          (subject && subject !== 'mixed' ? q.subject === subject : true) &&
          (targetTopic ? q.topic === targetTopic : true)
      );
    }
  }

  // Shuffle and return
  const shuffled = shuffle(pool);
  return shuffled.slice(0, count);
}

export function sampleMixedPaper(
  allQuestions: Question[],
  count: number,
  difficulty?: Difficulty | 'mixed'
): Question[] {
  const subjects: Array<'maths' | 'english' | 'verbal' | 'nonverbal'> = [
    'maths', 'english', 'verbal', 'nonverbal'
  ];
  const perSubject = Math.floor(count / 4);
  const remainder = count % 4;

  let result: Question[] = [];
  for (let i = 0; i < subjects.length; i++) {
    const subjectCount = perSubject + (i < remainder ? 1 : 0);
    const pool = difficulty && difficulty !== 'mixed'
      ? allQuestions.filter((q) => q.subject === subjects[i] && q.difficulty === difficulty)
      : allQuestions.filter((q) => q.subject === subjects[i]);
    result = result.concat(shuffle(pool).slice(0, subjectCount));
  }

  return shuffle(result);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
