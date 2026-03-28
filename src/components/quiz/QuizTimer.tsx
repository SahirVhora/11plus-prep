import { clsx } from 'clsx';

interface Props {
  timeRemaining: number;
  totalTime: number;
  formatTime: (s: number) => string;
}

export function QuizTimer({ timeRemaining, totalTime, formatTime }: Props) {
  const percent = totalTime > 0 ? (timeRemaining / totalTime) * 100 : 100;
  const isLow = percent < 20;
  const isCritical = percent < 10;

  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-4 py-2 rounded-xl font-bold transition-colors',
        isCritical ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300' :
        isLow ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300' :
        'bg-blue-50 text-primary dark:bg-blue-900/20 dark:text-blue-300'
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="text-xl" aria-hidden="true">{isCritical ? '⏰' : isLow ? '⌛' : '⏱️'}</span>
      <span className="text-lg tabular-nums" aria-label={`${timeRemaining} seconds remaining`}>
        {formatTime(timeRemaining)}
      </span>
      {/* Progress bar */}
      <div className="w-20 h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden" aria-hidden="true">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-1000',
            isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-blue-500'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
