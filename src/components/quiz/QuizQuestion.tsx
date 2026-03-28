import { useState } from 'react';
import type { Question } from '../../data/metadata';
import { SubjectBadge } from '../shared/SubjectBadge';
import { DifficultyBadge } from '../shared/DifficultyBadge';
import { clsx } from 'clsx';

interface Props {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | undefined;
  isFlagged: boolean;
  isReviewing?: boolean;
  onAnswer: (answer: string) => void;
  onFlag: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  isFlagged,
  isReviewing = false,
  onAnswer,
  onFlag,
  onNext,
  onPrev,
  onSubmit,
  isFirst,
  isLast,
}: Props) {
  const [textInput, setTextInput] = useState(selectedAnswer || '');

  const getOptionClass = (option: string) => {
    const letter = option.charAt(0);
    const isSelected = selectedAnswer === letter;

    if (isReviewing) {
      const isCorrect = letter === question.answer;
      const wasSelected = selectedAnswer === letter;
      if (isCorrect) return 'bg-emerald-50 border-emerald-400 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-500 dark:text-emerald-200';
      if (wasSelected && !isCorrect) return 'bg-red-50 border-red-400 text-red-800 dark:bg-red-900/30 dark:border-red-500 dark:text-red-200';
      return 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-400';
    }

    if (isSelected) return 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-200 shadow-sm';
    return 'bg-white border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700';
  };

  return (
    <div className="card max-w-2xl mx-auto animate-fade-in">
      {/* Header row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <SubjectBadge subject={question.subject} size="sm" />
        <DifficultyBadge difficulty={question.difficulty} size="sm" />
        <span className="text-xs text-gray-400 dark:text-slate-500 ml-auto">{question.topic}</span>
        {!isReviewing && (
          <button
            onClick={onFlag}
            aria-label={isFlagged ? 'Remove flag' : 'Flag for review'}
            aria-pressed={isFlagged}
            className={clsx(
              'p-1.5 rounded-lg transition-colors text-sm',
              isFlagged
                ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'
                : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
            )}
          >
            🚩
          </button>
        )}
      </div>

      {/* Context / passage */}
      {question.context && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 mb-5">
          <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">Reading Passage</p>
          <p className="font-serif text-sm leading-relaxed text-gray-700 dark:text-slate-200 whitespace-pre-line">{question.context}</p>
        </div>
      )}

      {/* Question */}
      <p className="question-text mb-6 font-serif text-lg leading-relaxed">
        {question.question}
      </p>

      {/* MCQ options */}
      {question.type === 'mcq' && question.options && (
        <div className="space-y-3" role="radiogroup" aria-label="Answer options">
          {question.options.map((opt) => {
            const letter = opt.charAt(0);
            // remove "A) " prefix - text shown inline
            const isCorrectInReview = isReviewing && letter === question.answer;
            const isWrongInReview = isReviewing && selectedAnswer === letter && letter !== question.answer;

            return (
              <button
                key={opt}
                role="radio"
                aria-checked={selectedAnswer === letter}
                onClick={() => !isReviewing && onAnswer(letter)}
                disabled={isReviewing}
                className={clsx(
                  'w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-150 min-h-[44px] flex items-center gap-3 font-medium',
                  getOptionClass(opt)
                )}
              >
                <span
                  className={clsx(
                    'w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm flex-shrink-0',
                    selectedAnswer === letter && !isReviewing ? 'border-blue-500 bg-blue-500 text-white' :
                    isCorrectInReview ? 'border-emerald-500 bg-emerald-500 text-white' :
                    isWrongInReview ? 'border-red-500 bg-red-500 text-white' :
                    'border-current bg-transparent'
                  )}
                >
                  {letter}
                </span>
                <span className="font-serif">{opt.slice(3)}</span>
                {isCorrectInReview && <span className="ml-auto text-emerald-600" aria-label="Correct">✓</span>}
                {isWrongInReview && <span className="ml-auto text-red-600" aria-label="Incorrect">✗</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Text input */}
      {question.type === 'text-input' && (
        <div>
          <label className="block text-sm font-semibold text-gray-600 dark:text-slate-300 mb-2" htmlFor="text-answer">
            Your answer:
          </label>
          <input
            id="text-answer"
            type="text"
            value={textInput}
            onChange={(e) => {
              setTextInput(e.target.value);
              onAnswer(e.target.value);
            }}
            disabled={isReviewing}
            className="w-full border-2 border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 font-serif text-lg dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-400"
            placeholder="Type your answer here..."
          />
          {isReviewing && (
            <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
              Correct answer: {question.answer}
            </p>
          )}
        </div>
      )}

      {/* Explanation (review mode) */}
      {isReviewing && question.explanation && (
        <div className="mt-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-4">
          <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1 uppercase tracking-wide">Explanation</p>
          <p className="text-sm text-gray-700 dark:text-slate-200 font-serif leading-relaxed">{question.explanation}</p>
        </div>
      )}

      {/* Nav buttons */}
      {!isReviewing && (
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
          <button
            onClick={onPrev}
            disabled={isFirst}
            className="btn-outline text-sm py-2 px-4 disabled:opacity-40"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-400 flex-1 text-center">
            {questionNumber} / {totalQuestions}
          </span>
          {isLast ? (
            <button onClick={onSubmit} className="btn-primary text-sm py-2 px-5">
              Submit Quiz ✓
            </button>
          ) : (
            <button onClick={onNext} className="btn-secondary text-sm py-2 px-4">
              Next →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
