import { clsx } from 'clsx';
import type { RegionConfig } from '../../data/regions';

interface Props {
  region: RegionConfig;
  size?: 'sm' | 'md';
  className?: string;
}

export function RegionBadge({ region, size = 'md', className }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1',
        'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-200',
        className
      )}
    >
      <span>{region.flag}</span>
      <span>{region.shortName}</span>
    </span>
  );
}
