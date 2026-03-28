import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Question } from '../../data/metadata';
import type { QuizResult, QuizConfig } from '../../hooks/useQuiz';
import { analyseScore, getTopicBreakdown, getSubjectBreakdown, formatTime } from '../../utils/scoreAnalyser';
import { SubjectBadge } from '../shared/SubjectBadge';
import { generatePaper } from '../../utils/pdfGenerator';
import { clsx } from 'clsx';

interface Props {
  result: QuizResult;
  questions: Question[];
  answers: Record<string, string>;
  config: QuizConfig;
  onRestart: () => void;
  onNewQuiz: () => void;
  onReview?: () => void;
}

export function QuizResults({ result, questions, answers, config, onRestart, onNewQuiz }: Props) {
  const navigate = useNavigate();
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [shareMsg, setShareMsg] = useState('');

  const { label, color, emoji } = analyseScore(result.percentage);
  const topicBreakdown = getTopicBreakdown(questions, answers);
  const subjectBreakdown = getSubjectBreakdown(questions, answers);
  const isMultiSubject = subjectBreakdown.length > 1;

  const handleDownload = async () => {
    setGenerating(true);
    try {
      await generatePaper({ questions, quizConfig: config, includeAnswers: true });
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = () => {
    const text = `I scored ${result.percentage}% (${result.score}/${result.totalQuestions}) on 11PlusPrep! ${emoji} Try it free at 11PlusPrep`;
    navigator.clipboard.writeText(text);
    setShareMsg('Copied to clipboard!');
    setTimeout(() => setShareMsg(''), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6 animate-fade-in">
      {/* Hero score */}
      <div className="card text-center bg-gradient-to-br from-primary to-blue-700 text-white">
        <div className="text-7xl font-extrabold mb-2">{result.percentage}%</div>
        <div className="text-2xl mb-1">{result.score} / {result.totalQuestions} correct</div>
        <div className={`text-xl font-bold mt-3 ${color.replace('text-', 'text-white/90 ')}`}>
          {emoji} {label}
        </div>
        <div className="mt-3 text-blue-200 text-sm">
          Time taken: {formatTime(result.timeSpentSeconds)}
        </div>
      </div>

      {/* Subject breakdown (mixed only) */}
      {isMultiSubject && (
        <div className="card">
          <h2 className="font-bold text-primary dark:text-blue-300 mb-4 text-lg">Subject Breakdown</h2>
          <div className="grid grid-cols-2 gap-3">
            {subjectBreakdown.map((s) => (
              <div key={s.subject} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-700">
                <SubjectBadge subject={s.subject as any} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${s.percentage}%`,
                        backgroundColor: s.percentage >= 80 ? '#2ECC71' : s.percentage >= 60 ? '#F4A435' : '#E74C3C',
                      }}
                    />
                  </div>
                </div>
                <span className="font-bold text-sm">{s.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak areas */}
      {result.weakTopics.length > 0 && (
        <div className="card border-2 border-amber-200 dark:border-amber-700">
          <h2 className="font-bold text-amber-700 dark:text-amber-300 mb-3 flex items-center gap-2">
            <span>⚠️</span> Areas to Improve
          </h2>
          <div className="space-y-2">
            {result.weakTopics.map((topic) => (
              <div key={topic} className="flex items-center justify-between gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <span className="text-sm font-semibold text-gray-700 dark:text-slate-200 capitalize">
                  {topic.replace(/-/g, ' ')}
                </span>
                <button
                  onClick={() => navigate(`/quiz?subject=${questions.find((q) => q.topic === topic)?.subject}&topic=${topic}`)}
                  className="text-xs btn-primary py-1.5 px-3"
                >
                  Practise this →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic breakdown table */}
      <div className="card">
        <h2 className="font-bold text-primary dark:text-blue-300 mb-4 text-lg">Topic Breakdown</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b dark:border-slate-700">
                <th className="pb-2 font-semibold">Topic</th>
                <th className="pb-2 font-semibold text-center">Score</th>
                <th className="pb-2 font-semibold w-24">Progress</th>
              </tr>
            </thead>
            <tbody>
              {topicBreakdown.map((t) => (
                <tr key={`${t.subject}-${t.topic}`} className="border-b border-gray-50 dark:border-slate-700/50">
                  <td className="py-2.5 font-medium capitalize text-gray-700 dark:text-slate-200">
                    {t.topic.replace(/-/g, ' ')}
                    <span className="ml-2 text-xs text-gray-400">{t.subject}</span>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className={clsx(
                      'font-bold',
                      t.percentage >= 80 ? 'text-emerald-600' : t.percentage >= 60 ? 'text-amber-600' : 'text-red-500'
                    )}>
                      {t.correct}/{t.total}
                    </span>
                  </td>
                  <td className="py-2.5">
                    <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${t.percentage}%`,
                          backgroundColor: t.percentage >= 80 ? '#2ECC71' : t.percentage >= 60 ? '#F4A435' : '#E74C3C',
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Question review */}
      <div className="card">
        <h2 className="font-bold text-primary dark:text-blue-300 mb-4 text-lg">Question Review</h2>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const userAns = answers[q.id] || '';
            const isCorrect = userAns.toUpperCase() === q.answer.toUpperCase();
            const isExpanded = expandedQuestion === q.id;

            return (
              <div key={q.id} className={clsx(
                'border-2 rounded-xl overflow-hidden',
                isCorrect ? 'border-emerald-200 dark:border-emerald-700' : 'border-red-200 dark:border-red-800'
              )}>
                <button
                  onClick={() => setExpandedQuestion(isExpanded ? null : q.id)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  aria-expanded={isExpanded}
                >
                  <span className={clsx(
                    'w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0',
                    isCorrect ? 'bg-emerald-500' : 'bg-red-500'
                  )}>
                    {isCorrect ? '✓' : '✗'}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-200 flex-1 text-left truncate">
                    Q{i + 1}. {q.question.slice(0, 80)}{q.question.length > 80 ? '…' : ''}
                  </span>
                  <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-slate-700 pt-3">
                    <p className="font-serif text-sm leading-relaxed text-gray-700 dark:text-slate-200">{q.question}</p>
                    {q.options && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt) => {
                          const letter = opt.charAt(0);
                          const isCorrectOpt = letter === q.answer;
                          const wasSelected = userAns.toUpperCase() === letter;
                          return (
                            <div key={opt} className={clsx(
                              'px-3 py-2 rounded-lg text-sm font-medium',
                              isCorrectOpt ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200' :
                              wasSelected ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                              'bg-gray-50 text-gray-500 dark:bg-slate-700 dark:text-slate-400'
                            )}>
                              {opt} {isCorrectOpt && '✓'} {wasSelected && !isCorrectOpt && '✗'}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {!isCorrect && (
                      <p className="text-sm text-gray-500 dark:text-slate-400">
                        Your answer: <span className="font-semibold text-red-600 dark:text-red-400">{userAns || 'Not answered'}</span>{' '}
                        • Correct: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{q.answer}</span>
                      </p>
                    )}
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-2">
                      <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">Explanation</p>
                      <p className="text-sm text-gray-700 dark:text-slate-200 font-serif">{q.explanation}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button onClick={onRestart} className="btn-outline text-sm py-3">
          🔄 Try Again
        </button>
        <button onClick={onNewQuiz} className="btn-outline text-sm py-3">
          🎯 New Quiz
        </button>
        <button onClick={handleDownload} disabled={generating} className="btn-secondary text-sm py-3">
          {generating ? '⏳ Generating...' : '📄 Download PDF'}
        </button>
        <button onClick={handleShare} className="btn-primary text-sm py-3 relative">
          📤 Share Result
          {shareMsg && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {shareMsg}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
