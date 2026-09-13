import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="journey-footer">
      <div className="journey-container footer-inner">
        <div>
          <span className="logo-mark" aria-hidden="true">
            G
          </span>
          <strong>Grammar Journey</strong>
          <p>A calm, private companion to a family’s 11+ year.</p>
        </div>
        <nav aria-label="Footer navigation">
          <Link to="/">Today</Link>
          <Link to="/journey">Year Journey</Link>
          <Link to="/parent">Parent Desk</Link>
          <Link to="/about">About 11+</Link>
        </nav>
        <p className="footer-note">
          Independent practice tool. Not affiliated with AE Tuition, Quest
          Assessment, GL Assessment or any school. Confirm admissions details
          with each school.
        </p>
      </div>
    </footer>
  );
}
