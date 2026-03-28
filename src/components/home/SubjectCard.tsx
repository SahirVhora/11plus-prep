import { useNavigate } from 'react-router-dom';
import type { SubjectMeta } from '../../data/metadata';

interface Props {
  subject: SubjectMeta;
  questionCount: number;
}

export function SubjectCard({ subject, questionCount }: Props) {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate(`/quiz?subject=${subject.id}`);
  };

  return (
    <div
      className={`card border-2 ${subject.borderColor} hover:shadow-lg transition-shadow duration-200 flex flex-col`}
    >
      <div className="flex items-start gap-3 mb-4">
        <span className="text-4xl" role="img" aria-label={subject.name}>{subject.icon}</span>
        <div>
          <h3 className="font-extrabold text-lg text-primary dark:text-blue-200">{subject.name}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">{questionCount}+ questions</p>
        </div>
      </div>

      <ul className="space-y-1 mb-5 flex-1">
        {subject.topics.slice(0, 3).map((t) => (
          <li key={t} className="text-sm text-gray-600 dark:text-slate-300 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0`} style={{ backgroundColor: subject.color }} />
            {t}
          </li>
        ))}
      </ul>

      <button
        onClick={handleStart}
        className="w-full btn-primary text-sm py-2.5"
        aria-label={`Start ${subject.name} practice`}
      >
        Practice Now →
      </button>
    </div>
  );
}
