import { DIFFICULTY_LABELS } from '../../data/metadata';
import type { Difficulty } from '../../data/metadata';
import { clsx } from 'clsx';

interface Props {
  difficulty: Difficulty;
  size?: 'sm' | 'md';
}

export function DifficultyBadge({ difficulty, size = 'md' }: Props) {
  const colors: Record<Difficulty, string> = {
    1: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    2: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    3: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-semibold',
        colors[difficulty],
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      )}
    >
      {DIFFICULTY_LABELS[difficulty]}
    </span>
  );
}
