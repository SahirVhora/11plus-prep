// React hooks used indirectly through custom hooks
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import { useTimer } from '../hooks/useTimer';
import { useWeakAreas } from '../hooks/useWeakAreas';
import { useApp } from '../context/appState';
import { QuizSetup } from '../components/quiz/QuizSetup';
import { QuizQuestion } from '../components/quiz/QuizQuestion';
import { QuizProgress } from '../components/quiz/QuizProgress';
import { QuizTimer } from '../components/quiz/QuizTimer';
import { QuizResults } from '../components/quiz/QuizResults';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { ErrorBanner } from '../components/shared/ErrorBanner';
import { sampleQuestions, sampleMixedPaper, sampleWeakAreaBiased } from '../utils/questionSampler';
import { generateQuestionsFromAI } from '../api/generateQuestions';
import type { QuizConfig } from '../hooks/useQuiz';

import type { Question } from '../data/metadata';

async function loadLondonQuestions(): Promise<Question[]> {
  const [maths, english, verbal, nonverbal] = await Promise.all([
    import('../data/questions/maths.json'),
    import('../data/questions/english.json'),
    import('../data/questions/verbal.json'),
    import('../data/questions/nonverbal.json'),
  ]);

  return [
    ...(maths.default as Question[]),
    ...(english.default as Question[]),
    ...(verbal.default as Question[]),
    ...(nonverbal.default as Question[]),
  ];
}

// Dynamically loads questions for a region. Falls back to London bank.
async function loadRegionQuestions(regionId: string): Promise<Question[]> {
  const londonQuestions = await loadLondonQuestions();

  if (!regionId || regionId === 'london') {
    return londonQuestions;
  }
  try {
    const mod = await import(`../data/questions/${regionId}.json`);
    const regional = mod.default as Question[];
    // Merge regional questions with London base (London questions fill any subject gaps)
    const regionalSubjects = new Set(regional.map((q) => q.subject));
    const londonFill = londonQuestions.filter((q) => !regionalSubjects.has(q.subject));
    return [...regional, ...londonFill];
  } catch {
    // If the regional bank doesn't exist yet, fall back to London
    return londonQuestions;
  }
}

export function Quiz() {
  const quiz = useQuiz();
  const { state: appState } = useApp();
  const { updateFromResults } = useWeakAreas();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const totalTimer = useTimer({
    initialSeconds: 2700,
    autoStart: false,
    onExpire: () => quiz.submit(),
  });
  const perQTimer = useTimer({
    initialSeconds: 45,
    autoStart: false,
    onExpire: () => {
      quiz.navigate('next');
      perQTimer.reset(45);
      setTimeout(() => perQTimer.start(), 100);
    },
  });

  // Load & start quiz
  const startQuiz = async (config: QuizConfig) => {
    quiz.startLoading(config);
    try {
      let questions: Question[];

      if (config.mode === 'ai') {
        const topicParam = searchParams.get('topic') || '';
        const topics = topicParam ? [topicParam] : ['general'];
        const subject = config.subject === 'mixed' ? 'maths' : config.subject;
        questions = await generateQuestionsFromAI({
          subject,
          difficulty: typeof config.difficulty === 'number' ? config.difficulty : 2,
          count: config.questionCount,
          topics,
          apiKey: appState.apiKey,
          regionId: config.regionId,
        });
      } else {
        const allQuestions = await loadRegionQuestions(config.regionId ?? 'london');
        const topicParam = searchParams.get('topic') || '';
        // ── Weak-area focused mode ──────────────────────────────────
        if (config.focusWeakTopics && config.focusWeakTopics.length > 0) {
          questions = sampleWeakAreaBiased(
            allQuestions,
            config.focusWeakTopics,
            config.questionCount,
            config.subject !== 'mixed' ? (config.subject as 'maths' | 'english' | 'verbal' | 'nonverbal') : undefined,
            config.difficulty !== 'mixed' ? config.difficulty : undefined,
          );
        } else if (config.subject === 'mixed') {
          questions = sampleMixedPaper(allQuestions, config.questionCount,
            config.difficulty !== 'mixed' ? config.difficulty : undefined);
        } else {
          questions = sampleQuestions(
            allQuestions,
            config.questionCount,
            config.difficulty !== 'mixed' ? config.difficulty : undefined,
            config.subject as 'maths' | 'english' | 'verbal' | 'nonverbal',
            topicParam || undefined
          );
        }
      }

      if (questions.length === 0) {
        quiz.loadError('No questions found for these settings. Try changing difficulty or subject.');
        return;
      }

      quiz.loadSuccess(questions);

      // Start timer
      if (config.timerMode.type === 'full-paper') {
        const secs = config.timerMode.totalSeconds || config.questionCount * 54;
        totalTimer.reset(secs);
        totalTimer.start();
      } else if (config.timerMode.type === 'per-question') {
        perQTimer.reset(45);
        perQTimer.start();
      }

      // Auto-PDF
      if (config.generatePdf) {
        const { generatePaper } = await import('../utils/pdfGenerator');
        generatePaper({ questions, quizConfig: config });
      }
    } catch (err: unknown) {
      quiz.loadError(err instanceof Error ? err.message : 'Failed to load questions. Please try again.');
    }
  };

  const handleSubmit = () => {
    totalTimer.pause();
    perQTimer.pause();
    quiz.submit();
    if (quiz.config) {
      updateFromResults(quiz.questions, quiz.answers);
    }
  };

  const handleRestart = () => {
    totalTimer.reset();
    perQTimer.reset();
    quiz.restart();
  };

  const handleNewQuiz = () => {
    totalTimer.reset();
    perQTimer.reset();
    quiz.reset();
    navigate('/quiz');
  };

  if (quiz.quizState === 'SETUP' || !quiz.config) {
    return (
      <div className="min-h-screen bg-bg dark:bg-slate-900">
        <QuizSetup onStart={startQuiz} />
        {quiz.error && (
          <div className="max-w-2xl mx-auto px-4 pb-8">
            <ErrorBanner message={quiz.error} onDismiss={() => quiz.loadError('')} />
          </div>
        )}
      </div>
    );
  }

  if (quiz.quizState === 'LOADING') {
    return (
      <div className="min-h-screen bg-bg dark:bg-slate-900 flex items-center justify-center">
        <LoadingSpinner
          size="lg"
          message={quiz.config.mode === 'ai' ? '✨ Claude is generating fresh questions...' : 'Loading questions...'}
        />
      </div>
    );
  }

  if (quiz.quizState === 'COMPLETE' && quiz.result) {
    return (
      <div className="min-h-screen bg-bg dark:bg-slate-900">
        <QuizResults
          result={quiz.result}
          questions={quiz.questions}
          answers={quiz.answers}
          config={quiz.config}
          onRestart={handleRestart}
          onNewQuiz={handleNewQuiz}
          onReview={quiz.review}
        />
      </div>
    );
  }

  const q = quiz.questions[quiz.currentIndex];
  if (!q) return null;

  const isReviewing = quiz.quizState === 'REVIEWING';
  const timerMode = quiz.config.timerMode;

  return (
    <div className="min-h-screen bg-bg dark:bg-slate-900">
      {/* Sticky top bar */}
      <div className="sticky top-16 z-30 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 py-3 px-4 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-2">
          <div className="flex items-center justify-between gap-4">
            <QuizProgress
              current={quiz.currentIndex}
              total={quiz.questions.length}
              answered={Object.keys(quiz.answers).length}
              flagged={quiz.flagged.size}
            />
            {timerMode.type !== 'off' && (
              <QuizTimer
                timeRemaining={timerMode.type === 'per-question' ? perQTimer.timeRemaining : totalTimer.timeRemaining}
                totalTime={timerMode.type === 'per-question' ? 45 : (timerMode.totalSeconds || 2700)}
                formatTime={timerMode.type === 'per-question' ? perQTimer.formatTime : totalTimer.formatTime}
              />
            )}
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="py-6 px-4">
        <QuizQuestion
          question={q}
          questionNumber={quiz.currentIndex + 1}
          totalQuestions={quiz.questions.length}
          selectedAnswer={quiz.answers[q.id]}
          isFlagged={quiz.flagged.has(q.id)}
          isReviewing={isReviewing}
          onAnswer={(ans) => quiz.answer(q.id, ans)}
          onFlag={() => quiz.flag(q.id)}
          onNext={() => quiz.navigate('next')}
          onPrev={() => quiz.navigate('prev')}
          onSubmit={handleSubmit}
          isFirst={quiz.currentIndex === 0}
          isLast={quiz.currentIndex === quiz.questions.length - 1}
        />

        {/* Review nav */}
        {isReviewing && (
          <div className="max-w-2xl mx-auto mt-4 flex items-center justify-between">
            <button
              onClick={() => quiz.navigate('prev')}
              disabled={quiz.currentIndex === 0}
              className="btn-outline text-sm py-2 px-4 disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="text-sm text-gray-400">
              {quiz.currentIndex + 1} / {quiz.questions.length}
            </span>
            {quiz.currentIndex < quiz.questions.length - 1 ? (
              <button onClick={() => quiz.navigate('next')} className="btn-secondary text-sm py-2 px-4">
                Next →
              </button>
            ) : (
              <button onClick={handleNewQuiz} className="btn-primary text-sm py-2 px-4">
                New Quiz
              </button>
            )}
          </div>
        )}

        {/* Question grid jump (not review mode) */}
        {!isReviewing && quiz.questions.length > 10 && (
          <div className="max-w-2xl mx-auto mt-6 card">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">Jump to question</p>
            <div className="flex flex-wrap gap-2">
              {quiz.questions.map((_, i) => {
                const qId = quiz.questions[i].id;
                const isAnswered = qId in quiz.answers;
                const isFlagged = quiz.flagged.has(qId);
                const isCurrent = i === quiz.currentIndex;
                return (
                  <button
                    key={i}
                    onClick={() => quiz.navigate('jump', i)}
                    aria-label={`Go to question ${i + 1}`}
                    aria-current={isCurrent ? 'true' : undefined}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-colors ${
                      isCurrent ? 'bg-primary text-white' :
                      isFlagged ? 'bg-amber-200 text-amber-700' :
                      isAnswered ? 'bg-emerald-100 text-emerald-700' :
                      'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
