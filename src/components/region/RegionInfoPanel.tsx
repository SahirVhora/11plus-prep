import { useState } from 'react';
import type { RegionConfig } from '../../data/regions';
import { clsx } from 'clsx';

const SUBJECT_LABELS: Record<string, { icon: string; label: string }> = {
  maths: { icon: '🔢', label: 'Maths' },
  english: { icon: '📖', label: 'English' },
  verbal: { icon: '🔤', label: 'Verbal Reasoning' },
  nonverbal: { icon: '🔷', label: 'Non-Verbal Reasoning' },
};

interface Props {
  region: RegionConfig;
  className?: string;
}

export function RegionInfoPanel({ region, className }: Props) {
  const [showSchools, setShowSchools] = useState(false);

  return (
    <div className={clsx('card space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{region.flag}</span>
        <div>
          <h3 className="font-extrabold text-primary dark:text-blue-300 text-lg leading-tight">{region.name}</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {region.examBoards.join(' / ')} · Tests in {region.testPeriod}
          </p>
        </div>
      </div>

      {/* Subjects tested */}
      <div>
        <p className="text-xs font-bold uppercase text-gray-400 mb-2">Subjects Tested</p>
        <div className="flex flex-wrap gap-2">
          {(['maths', 'english', 'verbal', 'nonverbal'] as const).map((s) => {
            const tested = region.subjects.includes(s);
            const meta = SUBJECT_LABELS[s];
            return (
              <span
                key={s}
                className={clsx(
                  'inline-flex items-center gap-1 rounded-full text-xs px-3 py-1 font-semibold',
                  tested
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-gray-100 text-gray-400 dark:bg-slate-700 dark:text-slate-500 line-through opacity-60'
                )}
                aria-label={tested ? `${meta.label} is tested` : `${meta.label} is not tested`}
              >
                {meta.icon} {meta.label}
              </span>
            );
          })}
          {region.hasCreativeWriting && (
            <span className="inline-flex items-center gap-1 rounded-full text-xs px-3 py-1 font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              ✍️ Creative Writing
            </span>
          )}
        </div>
      </div>

      {/* Test format */}
      <div>
        <p className="text-xs font-bold uppercase text-gray-400 mb-1">Format</p>
        <p className="text-sm text-gray-600 dark:text-slate-300">{region.testFormat}</p>
      </div>

      {/* Papers */}
      <div className="flex flex-wrap gap-2">
        {region.papers.map((paper) => (
          <span
            key={paper}
            className="text-xs bg-blue-50 dark:bg-blue-900/20 text-primary dark:text-blue-300 rounded-lg px-2 py-1 font-semibold"
          >
            {paper}
          </span>
        ))}
      </div>

      {/* Key dates */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
          <p className="text-xs font-bold text-gray-400 mb-1">📅 Registration</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">{region.registrationPeriod}</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-3">
          <p className="text-xs font-bold text-gray-400 mb-1">📝 Test Date</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">{region.testPeriod}</p>
        </div>
      </div>

      {/* Tips */}
      <div>
        <p className="text-xs font-bold uppercase text-gray-400 mb-2">Top Tips</p>
        <ul className="space-y-1.5">
          {region.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-300">
              <span className="text-primary dark:text-blue-400 mt-0.5 shrink-0">→</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Schools toggle */}
      <div>
        <button
          onClick={() => setShowSchools(!showSchools)}
          className="text-sm font-semibold text-primary dark:text-blue-400 hover:underline focus:outline-none"
        >
          {showSchools ? '▲ Hide' : '▼ Show'} grammar schools in this region ({region.notableSchools.length})
        </button>
        {showSchools && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {region.notableSchools.map((school) => (
              <div key={school.name} className="flex items-start gap-2 text-sm">
                <span className="text-gray-400 shrink-0">🏫</span>
                <div>
                  <p className="font-semibold text-gray-700 dark:text-slate-200 leading-tight">{school.name}</p>
                  <p className="text-xs text-gray-400">{school.area}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
