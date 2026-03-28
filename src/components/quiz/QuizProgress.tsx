interface Props {
  current: number;
  total: number;
  answered: number;
  flagged: number;
}

export function QuizProgress({ current, total, answered, flagged }: Props) {
  const percent = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm font-semibold text-gray-600 dark:text-slate-300">
        <span>Question {current + 1} of {total}</span>
        <div className="flex gap-3">
          <span className="text-emerald-600 dark:text-emerald-400">✓ {answered} answered</span>
          {flagged > 0 && (
            <span className="text-amber-600 dark:text-amber-400">🚩 {flagged} flagged</span>
          )}
        </div>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total}>
        <div
          className="h-full bg-secondary rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
