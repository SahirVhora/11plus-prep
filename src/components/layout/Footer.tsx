import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-primary dark:bg-slate-900 text-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-extrabold text-lg mb-3">🎓 11PlusPrep</h3>
            <p className="text-blue-200 text-sm leading-relaxed">
              Free 11+ practice for UK children across all 12 regions. 600+ questions
              covering GL Assessment, CEM, AQE and CSSE exam board styles.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-base mb-3">Subjects</h3>
            <ul className="space-y-1 text-blue-200 text-sm">
              <li><Link to="/quiz" className="hover:text-white transition-colors">🔢 Maths</Link></li>
              <li><Link to="/quiz" className="hover:text-white transition-colors">📖 English</Link></li>
              <li><Link to="/quiz" className="hover:text-white transition-colors">🔤 Verbal Reasoning</Link></li>
              <li><Link to="/quiz" className="hover:text-white transition-colors">🔷 Non-Verbal Reasoning</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-base mb-3">Resources</h3>
            <ul className="space-y-1 text-blue-200 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About the 11+</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">UK Grammar Schools</Link></li>
              <li>
                <a
                  href="https://www.gl-assessment.co.uk/products/11-plus/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  GL Assessment ↗
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-blue-800 dark:border-slate-700 pt-6 text-center text-blue-300 text-xs space-y-1">
          <p>
            <strong>Disclaimer:</strong> This is an independent preparation tool. Not affiliated with GL Assessment,
            any grammar school, or local authority. Question content is original and created for practice purposes only.
          </p>
          <p>© {new Date().getFullYear()} 11PlusPrep. Free to use. No account needed.</p>
        </div>
      </div>
    </footer>
  );
}
