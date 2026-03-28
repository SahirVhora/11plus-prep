import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Subject, Difficulty } from '../../data/metadata';
import { useApp } from '../../context/AppContext';
import { useRegion } from '../../hooks/useRegion';
import { ModeToggle } from '../layout/ModeToggle';
import { RegionSelector } from '../region/RegionSelector';
import { RegionInfoPanel } from '../region/RegionInfoPanel';
import type { QuizConfig, TimerMode } from '../../hooks/useQuiz';

interface Props {
  onStart: (config: QuizConfig) => void;
}

const ALL_SUBJECT_OPTIONS: Array<{ id: Subject | 'mixed'; label: string; icon: string }> = [
  { id: 'maths', label: 'Maths', icon: '🔢' },
  { id: 'english', label: 'English', icon: '📖' },
  { id: 'verbal', label: 'Verbal Reasoning', icon: '🔤' },
  { id: 'nonverbal', label: 'Non-Verbal', icon: '🔷' },
  { id: 'mixed', label: 'Mixed Paper', icon: '📋' },
];

const QUESTION_COUNTS = [10, 20, 30, 50];

export function QuizSetup({ onStart }: Props) {
  const [searchParams] = useSearchParams();
  const defaultSubject = (searchParams.get('subject') as Subject) || 'maths';

  const { state } = useApp();
  const { region } = useRegion();
  const [showRegionInfo, setShowRegionInfo] = useState(false);

  // Subject options gated to what this region tests
  const availableSubjects = ALL_SUBJECT_OPTIONS.filter((opt) => {
    if (opt.id === 'mixed') return true; // always show mixed
    return region.subjects.includes(opt.id as 'maths' | 'english' | 'verbal' | 'nonverbal');
  });

  // Ensure default subject is valid for the selected region
  const safeDefaultSubject: Subject | 'mixed' =
    region.subjects.includes(defaultSubject as 'maths' | 'english' | 'verbal' | 'nonverbal')
      ? defaultSubject
      : (region.subjects[0] as Subject) ?? 'maths';

  const [subject, setSubject] = useState<Subject | 'mixed'>(safeDefaultSubject);
  const [difficulty, setDifficulty] = useState<Difficulty | 'mixed'>('mixed');
  const [count, setCount] = useState(20);
  const [customCount, setCustomCount] = useState(20);
  const [useCustom, setUseCustom] = useState(false);
  const [timerType, setTimerType] = useState<'off' | 'per-question' | 'full-paper'>('off');
  const [generatePdf, setGeneratePdf] = useState(false);

  const finalCount = useCustom ? customCount : count;

  const handleStart = () => {
    const timerMode: TimerMode =
      timerType === 'per-question' ? { type: 'per-question', secondsPerQuestion: 45 } :
      timerType === 'full-paper' ? { type: 'full-paper', totalSeconds: finalCount * 54 } :
      { type: 'off' };

    onStart({
      mode: state.mode,
      subject,
      difficulty,
      questionCount: finalCount,
      timerMode,
      generatePdf,
      regionId: region.id,
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-primary dark:text-blue-300 mb-2">Set Up Your Quiz</h1>
        <p className="text-gray-500 dark:text-slate-400">Choose your region, subject and settings, then start practising.</p>
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-slate-800 rounded-xl px-4 py-2">
            <span className="text-sm font-semibold text-gray-500 dark:text-slate-400">Mode:</span>
            <ModeToggle />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Region */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-primary dark:text-blue-300">0. Your Region</h2>
            <button
              onClick={() => setShowRegionInfo(!showRegionInfo)}
              className="text-xs text-primary dark:text-blue-400 hover:underline"
            >
              {showRegionInfo ? 'Hide info' : 'About this test'}
            </button>
          </div>
          <RegionSelector />
          {showRegionInfo && (
            <div className="mt-4">
              <RegionInfoPanel region={region} />
            </div>
          )}
          {region.hasCreativeWriting && (
            <p className="mt-3 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
              ✍️ This region includes creative writing — practice timed essays and stories too.
            </p>
          )}
        </div>

        {/* Subject */}
        <div className="card">
          <h2 className="font-bold text-primary dark:text-blue-300 mb-4">1. Choose Subject</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableSubjects.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSubject(opt.id)}
                className={`p-3 rounded-xl border-2 font-semibold text-sm transition-all text-center flex flex-col items-center gap-1 min-h-[70px] ${
                  subject === opt.id
                    ? 'border-secondary bg-amber-50 text-secondary dark:bg-amber-900/20'
                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:text-slate-300'
                }`}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
          {region.subjects.length < 4 && (
            <p className="mt-3 text-xs text-gray-400 dark:text-slate-500">
              Only subjects tested in {region.shortName} are shown.
            </p>
          )}
        </div>

        {/* Difficulty */}
        <div className="card">
          <h2 className="font-bold text-primary dark:text-blue-300 mb-4">2. Difficulty</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setDifficulty('mixed')}
              className={`p-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                difficulty === 'mixed'
                  ? 'border-secondary bg-amber-50 text-secondary dark:bg-amber-900/20'
                  : 'border-gray-200 dark:border-slate-600 dark:text-slate-300'
              }`}
            >
              Mixed
            </button>
            {([1, 2, 3] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`p-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                  difficulty === d
                    ? 'border-secondary bg-amber-50 text-secondary dark:bg-amber-900/20'
                    : 'border-gray-200 dark:border-slate-600 dark:text-slate-300'
                }`}
              >
                {d === 1 ? '⭐ Easy' : d === 2 ? '⭐⭐ Standard' : '⭐⭐⭐ Stretch'}
              </button>
            ))}
          </div>
        </div>

        {/* Question count */}
        <div className="card">
          <h2 className="font-bold text-primary dark:text-blue-300 mb-4">3. Number of Questions</h2>
          <div className="flex flex-wrap gap-3 mb-4">
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => { setCount(n); setUseCustom(false); }}
                className={`px-5 py-2.5 rounded-xl border-2 font-bold transition-all ${
                  !useCustom && count === n
                    ? 'border-secondary bg-amber-50 text-secondary dark:bg-amber-900/20'
                    : 'border-gray-200 dark:border-slate-600 dark:text-slate-300'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setUseCustom(true)}
              className={`px-5 py-2.5 rounded-xl border-2 font-bold transition-all ${
                useCustom
                  ? 'border-secondary bg-amber-50 text-secondary dark:bg-amber-900/20'
                  : 'border-gray-200 dark:border-slate-600 dark:text-slate-300'
              }`}
            >
              Custom
            </button>
          </div>
          {useCustom && (
            <div>
              <input
                type="range"
                min={5}
                max={50}
                value={customCount}
                onChange={(e) => setCustomCount(Number(e.target.value))}
                className="w-full accent-amber-500"
                aria-label="Number of questions"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5</span>
                <span className="font-bold text-secondary text-sm">{customCount} questions</span>
                <span>50</span>
              </div>
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="card">
          <h2 className="font-bold text-primary dark:text-blue-300 mb-4">4. Timer</h2>
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'off', label: '⏸️ No Timer' },
              { value: 'per-question', label: '⏱️ 45s per question' },
              { value: 'full-paper', label: '📋 Full paper timer' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTimerType(value as 'off' | 'per-question' | 'full-paper')}
                className={`px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
                  timerType === value
                    ? 'border-secondary bg-amber-50 text-secondary dark:bg-amber-900/20'
                    : 'border-gray-200 dark:border-slate-600 dark:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* PDF option */}
        <div className="card">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={generatePdf}
              onChange={(e) => setGeneratePdf(e.target.checked)}
              className="w-5 h-5 accent-amber-500"
            />
            <span className="font-semibold dark:text-slate-200">📄 Also download a printable PDF paper</span>
          </label>
        </div>

        {/* AI mode warning */}
        {state.mode === 'ai' && !state.apiKey && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 text-sm text-amber-700 dark:text-amber-300">
            ⚠️ AI mode requires an Anthropic API key. Open Settings (⚙️) to add your key, or switch to Free mode.
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={state.mode === 'ai' && !state.apiKey}
          className="w-full btn-primary text-lg py-4 shadow-lg"
        >
          🚀 Start Quiz — {finalCount} Questions
        </button>
      </div>
    </div>
  );
}
