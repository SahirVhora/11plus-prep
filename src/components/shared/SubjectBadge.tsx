import { SUBJECTS } from '../../data/metadata';
import type { Subject } from '../../data/metadata';
import { clsx } from 'clsx';

interface Props {
  subject: Subject;
  size?: 'sm' | 'md';
}

export function SubjectBadge({ subject, size = 'md' }: Props) {
  const meta = SUBJECTS.find((s) => s.id === subject);
  if (!meta) return null;

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full font-semibold',
        meta.bgColor,
        meta.textColor,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      )}
    >
      <span>{meta.icon}</span>
      <span>{meta.name}</span>
    </span>
  );
}
