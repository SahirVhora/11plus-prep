import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useRegion } from '../../hooks/useRegion';

export function HeroSection() {
  const { state } = useApp();
  const { region } = useRegion();

  const subjectLine = region.subjects
    .map((s) => {
      if (s === 'maths') return 'Maths';
      if (s === 'english') return 'English';
      if (s === 'verbal') return 'Verbal Reasoning';
      if (s === 'nonverbal') return 'Non-Verbal Reasoning';
      return s;
    })
    .join(' · ');

  const examBoardLine = region.examBoards.join(' / ');

  return (
    <section className="bg-gradient-to-br from-primary to-blue-800 text-white py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
          <span>{region.flag}</span>
          <span>{region.name} · Free · No account needed · 300+ questions</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
          Free 11+ Practice for{' '}
          <span className="text-secondary">{region.name}</span>
        </h1>

        <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-4">
          {subjectLine}
        </p>
        <p className="text-blue-200 max-w-xl mx-auto mb-8">
          Aligned with {examBoardLine}. Instant results. Printable PDF papers.{' '}
          {state.mode === 'ai' ? 'AI-powered fresh questions every session.' : 'Works offline after first load.'}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/quiz"
            className="inline-flex items-center justify-center btn-primary text-base py-3.5 px-8 shadow-lg"
          >
            Start Practising →
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center justify-center border-2 border-white text-white font-bold py-3.5 px-8 rounded-xl hover:bg-white/10 transition-colors min-h-[44px]"
          >
            How it works ↓
          </a>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 mt-12 max-w-lg mx-auto">
          {[
            { value: '300+', label: 'Questions' },
            { value: '4', label: 'Subjects' },
            { value: '100%', label: 'Free' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-extrabold text-secondary">{value}</div>
              <div className="text-sm text-blue-200">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
