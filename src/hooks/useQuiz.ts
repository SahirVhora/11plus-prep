import { useReducer, useCallback } from 'react';
import type { Question, Subject, Difficulty } from '../data/metadata';

export type QuizState = 'SETUP' | 'LOADING' | 'IN_PROGRESS' | 'REVIEWING' | 'COMPLETE';

export interface TimerMode {
  type: 'off' | 'per-question' | 'full-paper';
  secondsPerQuestion?: number;
  totalSeconds?: number;
}

export interface QuizConfig {
  mode: 'free' | 'ai';
  subject: Subject;
  difficulty: Difficulty | 'mixed';
  questionCount: number;
  timerMode: TimerMode;
  generatePdf: boolean;
  regionId?: string;
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  topicScores: Record<string, { correct: number; total: number }>;
  weakTopics: string[];
  completedAt: string;
}

interface State {
  quizState: QuizState;
  config: QuizConfig | null;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, string>;
  flagged: Set<string>;
  startedAt: Date | null;
  result: QuizResult | null;
  error: string | null;
}

type Action =
  | { type: 'START_LOADING'; config: QuizConfig }
  | { type: 'LOAD_SUCCESS'; questions: Question[] }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'ANSWER'; questionId: string; answer: string }
  | { type: 'FLAG'; questionId: string }
  | { type: 'NAVIGATE'; direction: 'next' | 'prev' | 'jump'; index?: number }
  | { type: 'SUBMIT' }
  | { type: 'REVIEW' }
  | { type: 'RESTART' }
  | { type: 'RESET' };

const initial: State = {
  quizState: 'SETUP',
  config: null,
  questions: [],
  currentIndex: 0,
  answers: {},
  flagged: new Set(),
  startedAt: null,
  result: null,
  error: null,
};

function computeResult(
  questions: Question[],
  answers: Record<string, string>,
  startedAt: Date
): QuizResult {
  const topicScores: Record<string, { correct: number; total: number }> = {};
  let correct = 0;

  for (const q of questions) {
    const userAns = (answers[q.id] || '').toUpperCase();
    const correctAns = q.answer.toUpperCase();
    const isCorrect = userAns === correctAns;
    if (isCorrect) correct++;

    if (!topicScores[q.topic]) topicScores[q.topic] = { correct: 0, total: 0 };
    topicScores[q.topic].total++;
    if (isCorrect) topicScores[q.topic].correct++;
  }

  const weakTopics = Object.entries(topicScores)
    .filter(([, s]) => s.total > 0 && s.correct / s.total < 0.6)
    .map(([t]) => t);

  return {
    score: correct,
    totalQuestions: questions.length,
    percentage: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
    timeSpentSeconds: Math.round((Date.now() - startedAt.getTime()) / 1000),
    topicScores,
    weakTopics,
    completedAt: new Date().toISOString(),
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_LOADING':
      return { ...initial, quizState: 'LOADING', config: action.config };
    case 'LOAD_SUCCESS':
      return {
        ...state,
        quizState: 'IN_PROGRESS',
        questions: action.questions,
        currentIndex: 0,
        answers: {},
        flagged: new Set(),
        startedAt: new Date(),
        result: null,
        error: null,
      };
    case 'LOAD_ERROR':
      return { ...state, quizState: 'SETUP', error: action.error };
    case 'ANSWER':
      return { ...state, answers: { ...state.answers, [action.questionId]: action.answer } };
    case 'FLAG': {
      const flagged = new Set(state.flagged);
      if (flagged.has(action.questionId)) flagged.delete(action.questionId);
      else flagged.add(action.questionId);
      return { ...state, flagged };
    }
    case 'NAVIGATE': {
      let idx = state.currentIndex;
      if (action.direction === 'next') idx = Math.min(idx + 1, state.questions.length - 1);
      else if (action.direction === 'prev') idx = Math.max(idx - 1, 0);
      else if (action.direction === 'jump' && action.index !== undefined) idx = action.index;
      return { ...state, currentIndex: idx };
    }
    case 'SUBMIT': {
      if (!state.startedAt) return state;
      const result = computeResult(state.questions, state.answers, state.startedAt);
      return { ...state, quizState: 'COMPLETE', result };
    }
    case 'REVIEW':
      return { ...state, quizState: 'REVIEWING', currentIndex: 0 };
    case 'RESTART':
      return { ...initial, config: state.config };
    case 'RESET':
      return initial;
    default:
      return state;
  }
}

export function useQuiz() {
  const [state, dispatch] = useReducer(reducer, initial);

  const startLoading = useCallback((config: QuizConfig) => {
    dispatch({ type: 'START_LOADING', config });
  }, []);

  const loadSuccess = useCallback((questions: Question[]) => {
    dispatch({ type: 'LOAD_SUCCESS', questions });
  }, []);

  const loadError = useCallback((error: string) => {
    dispatch({ type: 'LOAD_ERROR', error });
  }, []);

  const answer = useCallback((questionId: string, ans: string) => {
    dispatch({ type: 'ANSWER', questionId, answer: ans });
  }, []);

  const flag = useCallback((questionId: string) => {
    dispatch({ type: 'FLAG', questionId });
  }, []);

  const navigate = useCallback((direction: 'next' | 'prev' | 'jump', index?: number) => {
    dispatch({ type: 'NAVIGATE', direction, index });
  }, []);

  const submit = useCallback(() => {
    dispatch({ type: 'SUBMIT' });
  }, []);

  const review = useCallback(() => {
    dispatch({ type: 'REVIEW' });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    ...state,
    startLoading,
    loadSuccess,
    loadError,
    answer,
    flag,
    navigate,
    submit,
    review,
    restart,
    reset,
  };
}
