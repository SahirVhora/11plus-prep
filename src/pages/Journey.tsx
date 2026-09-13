import { Link } from "react-router-dom";
import {
  COURSE_MILESTONES,
  FGP36_SESSIONS,
  SCHOOL_ROUTES,
  SUBJECT_LABELS,
} from "../features/journey/data";
import {
  getCourseProgress,
  getKendrickEligibility,
  getNextSession,
} from "../features/journey/model";
import { useJourney } from "../features/journey/useJourney";

function formatDate(date: string, long = false) {
  return new Intl.DateTimeFormat(
    "en-GB",
    long
      ? { weekday: "short", day: "numeric", month: "long", year: "numeric" }
      : { day: "numeric", month: "short" },
  ).format(new Date(`${date}T12:00:00`));
}

export function Journey() {
  const { journey, toggleSchool } = useJourney();
  const next = getNextSession();
  const kendrick = getKendrickEligibility(journey.outwardPostcode);

  return (
    <main className="journey-page pale-page">
      <section className="inner-hero journey-container">
        <div>
          <p className="eyebrow">September 2026 - September 2027</p>
          <h1>
            The whole journey,
            <br />
            <em>held lightly.</em>
          </h1>
        </div>
        <div className="progress-medallion">
          <strong>{getCourseProgress()}%</strong>
          <span>
            course
            <br />
            complete
          </span>
        </div>
      </section>

      <section className="journey-container journey-summary-grid">
        <article className="premium-panel next-session-card">
          <p className="eyebrow">Next AE session</p>
          {next ? (
            <>
              <h2>Session {next.number}</h2>
              <p className="large-date">{formatDate(next.date, true)}</p>
              <p>FGP36 · 12:30-3:00pm · AE Tuition Feltham</p>
            </>
          ) : (
            <h2>Course complete</h2>
          )}
        </article>
        <article className="premium-panel calm-card">
          <p className="eyebrow">This month’s principle</p>
          <h2>Accuracy before speed.</h2>
          <p>
            Early scores are information, not a verdict. Build technique and
            confidence before adding time pressure.
          </p>
        </article>
      </section>

      <section className="journey-container section-space">
        <div className="section-heading">
          <p className="eyebrow">Course milestones</p>
          <h2>Five seasons of progress</h2>
        </div>
        <div className="timeline">
          {COURSE_MILESTONES.map((milestone, index) => (
            <article key={milestone.date} className="timeline-item">
              <div className="timeline-dot">{index + 1}</div>
              <div>
                <time>{formatDate(milestone.date)}</time>
                <h3>{milestone.title}</h3>
                <p>{milestone.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="school-section">
        <div className="journey-container">
          <div className="section-heading split-heading light-copy">
            <div>
              <p className="eyebrow light">Target-school routes</p>
              <h2>Prepare broadly. Decide carefully.</h2>
            </div>
            <p>
              Selection keeps a school visible in your family plan; it does not
              claim eligibility or guarantee admission.
            </p>
          </div>
          <div className="school-grid">
            {SCHOOL_ROUTES.map((school) => {
              const selected = journey.selectedSchoolIds.includes(school.id);
              return (
                <article
                  key={school.id}
                  className={`school-card ${selected ? "selected" : ""}`}
                >
                  <div className="school-card-top">
                    <span className={`status-pill status-${school.status}`}>
                      {school.status}
                    </span>
                    <button
                      aria-pressed={selected}
                      onClick={() => toggleSchool(school.id)}
                    >
                      {selected ? "Following ✓" : "Follow route"}
                    </button>
                  </div>
                  <h3>{school.name}</h3>
                  <p className="school-location">
                    {school.location} · {school.route}
                  </p>
                  <div className="subject-pills">
                    {school.subjects.map((subject) => (
                      <span key={subject}>{SUBJECT_LABELS[subject]}</span>
                    ))}
                  </div>
                  <p>{school.note}</p>
                  {school.id === "kendrick" && (
                    <div className={`eligibility-note ${kendrick}`}>
                      {kendrick === "unknown" &&
                        "Add a postcode district/sector in Parent Desk to run a preliminary area check."}
                      {kendrick === "outside-area" &&
                        "The entered postcode appears outside Kendrick’s currently published designated area."}
                      {kendrick === "likely-in-area" &&
                        "The entered postcode may be within Kendrick’s current area. Confirm against the final 2028 policy."}
                    </div>
                  )}
                  <a
                    href={school.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {school.sourceLabel} ↗
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="journey-container session-list-section">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">All 40 sessions</p>
            <h2>Nothing important gets lost.</h2>
          </div>
          <Link className="text-link" to="/parent">
            Add calendar reminders →
          </Link>
        </div>
        <div className="session-grid">
          {FGP36_SESSIONS.map((session) => (
            <div
              key={session.number}
              className={next?.number === session.number ? "next" : ""}
            >
              <span>{session.number}</span>
              <time>{formatDate(session.date)}</time>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
