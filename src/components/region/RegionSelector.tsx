import { useState } from 'react';
import { REGIONS } from '../../data/regions';
import { useRegion } from '../../hooks/useRegion';
import { clsx } from 'clsx';

interface Props {
  onClose?: () => void;
  compact?: boolean;
}

export function RegionSelector({ onClose, compact = false }: Props) {
  const { region, setRegion } = useRegion();
  const [search, setSearch] = useState('');

  const filtered = REGIONS.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.shortName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (id: string) => {
    setRegion(id);
    onClose?.();
  };

  if (compact) {
    return (
      <div className="relative">
        <select
          value={region.id}
          onChange={(e) => setRegion(e.target.value)}
          className="appearance-none bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 pr-8 text-sm font-semibold text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          aria-label="Select region"
        >
          {REGIONS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.flag} {r.shortName}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">▾</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <input
        type="search"
        placeholder="Search region..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:text-slate-200"
        aria-label="Search regions"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-1">
        {filtered.map((r) => {
          const isSelected = r.id === region.id;
          return (
            <button
              key={r.id}
              onClick={() => handleSelect(r.id)}
              className={clsx(
                'flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all',
                isSelected
                  ? 'border-primary bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
              )}
              aria-pressed={isSelected}
            >
              <span className="text-2xl leading-none mt-0.5">{r.flag}</span>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-gray-800 dark:text-slate-100 leading-tight">{r.shortName}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">
                  {r.examBoards.join(', ')} · {r.subjects.join(', ')}
                </p>
              </div>
              {isSelected && (
                <span className="ml-auto text-primary text-sm font-bold shrink-0">✓</span>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="col-span-2 text-center text-gray-400 py-8">No regions match "{search}"</p>
        )}
      </div>
    </div>
  );
}
