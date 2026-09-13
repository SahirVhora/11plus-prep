import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SUBJECT_LABELS } from "../features/journey/data";
import {
  getCourseProgress,
  getNextSession,
  getTodayMission,
} from "../features/journey/model";
import type { Confidence } from "../features/journey/types";
import { useJourney } from "../features/journey/useJourney";

const SUBJECT_ART: Record<string, string> = {
  english: "Aa",
  maths: "×÷",
  verbal: "ab",
  nonverbal: "◇",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${date}T12:00:00`));
}

export function Home() {
  const { journey, completeMission } = useJourney();
  const [missionOpen, setMissionOpen] = useState(false);
  const [finished, setFinished] = useState(false);
  const mission = useMemo(() => getTodayMission(), []);
  const nextSession = getNextSession();
  const completion = journey.completedMissions[mission.id];
  const learner = "Explorer";

  const finishMission = (confidence: Confidence) => {
    completeMission(mission.id, confidence);
    setFinished(true);
  };

  if (missionOpen) {
    return (
      <main className="journey-page mission-stage" data-testid="mission-view">
        <div className="mission-orbit mission-orbit-one" aria-hidden="true" />
        <div className="mission-orbit mission-orbit-two" aria-hidden="true" />
        <section className="mission-shell">
          <button
            className="quiet-button"
            onClick={() => setMissionOpen(false)}
          >
            ← Back to today
          </button>
          {!finished ? (
            <>
              <div className={`subject-gem subject-${mission.subject}`}>
                {SUBJECT_ART[mission.subject]}
              </div>
              <p className="eyebrow">
                {mission.eyebrow} · {mission.minutes} minutes
              </p>
              <h1>{mission.title}</h1>
              <p className="mission-intro">{mission.introduction}</p>
              <ol className="mission-steps">
                {mission.steps.map((step, index) => (
                  <li key={step}>
                    <span>{index + 1}</span>
                    <p>{step}</p>
                  </li>
                ))}
              </ol>
              <div className="offline-card">
                <span aria-hidden="true">☀</span>
                <div>
                  <strong>Now leave the screen</strong>
                  <p>{mission.offlineChallenge}</p>
                </div>
              </div>
              <div className="mission-finish">
                <p>When you return, how did it feel?</p>
                <div
                  className="confidence-row"
                  role="group"
                  aria-label="Mission confidence"
                >
                  <button onClick={() => finishMission("tricky")}>
                    Tricky
                  </button>
                  <button onClick={() => finishMission("okay")}>Okay</button>
                  <button onClick={() => finishMission("easy")}>Easy</button>
                </div>
              </div>
              <aside className="parent-whisper">
                <strong>For a grown-up:</strong> {mission.parentPrompt}
              </aside>
            </>
          ) : (
            <div className="celebration-card" role="status">
              <div className="celebration-mark">✓</div>
              <p className="eyebrow">Mission complete</p>
              <h1>A small win becomes a strong habit.</h1>
              <p>
                You have finished today’s mission. Go enjoy the rest of your day
                - there is nothing else to unlock.
              </p>
              <button
                className="journey-button"
                onClick={() => setMissionOpen(false)}
              >
                Return home
              </button>
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="journey-page">
      <section className="journey-hero">
        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="hero-glow hero-glow-two" aria-hidden="true" />
        <div className="journey-container hero-grid">
          <div className="hero-copy">
            <p className="eyebrow light">FGP36 · Sunday learning journey</p>
            <h1>
              Little steps.
              <br />
              <em>Remarkable places.</em>
            </h1>
            <p className="hero-lead">
              A calm 11+ journey built around AE Tuition, thoughtful practice
              and time away from the screen.
            </p>
            <div className="hero-actions">
              <button
                className="journey-button coral"
                onClick={() => setMissionOpen(true)}
                data-testid="start-mission"
              >
                {completion
                  ? "Replay today’s mission"
                  : "Begin today’s mission"}{" "}
                <span>→</span>
              </button>
              <Link className="text-link light-link" to="/journey">
                See the year journey
              </Link>
            </div>
          </div>
          <div className="today-card">
            <div className="today-topline">
              <span>Today</span>
              <span>{mission.minutes} min</span>
            </div>
            <div className={`subject-gem subject-${mission.subject}`}>
              {SUBJECT_ART[mission.subject]}
            </div>
            <p className="eyebrow">{SUBJECT_LABELS[mission.subject]}</p>
            <h2>{mission.title}</h2>
            <p>{mission.introduction}</p>
            <div className="screen-promise">
              <span>◌</span> Mostly off-screen
            </div>
          </div>
        </div>
      </section>

      <section
        className="journey-container dashboard-strip"
        aria-label="Journey at a glance"
      >
        <article>
          <span className="stat-icon">✦</span>
          <div>
            <strong>{Object.keys(journey.completedMissions).length}</strong>
            <p>missions explored</p>
          </div>
        </article>
        <article>
          <span className="stat-icon">↗</span>
          <div>
            <strong>{getCourseProgress()}%</strong>
            <p>through the AE course</p>
          </div>
        </article>
        <article>
          <span className="stat-icon">⌁</span>
          <div>
            <strong>
              {nextSession ? `Session ${nextSession.number}` : "Complete"}
            </strong>
            <p>
              {nextSession
                ? formatDate(nextSession.date)
                : "Course journey finished"}
            </p>
          </div>
        </article>
      </section>

      <section className="journey-container section-space">
        <div className="section-heading split-heading">
          <div>
            <p className="eyebrow">Made for {learner}</p>
            <h2>Learning without the overload</h2>
          </div>
          <p>
            One focused mission. One useful conversation. Then the screen goes
            away.
          </p>
        </div>
        <div className="principle-grid">
          <article className="principle-card plum">
            <span>01</span>
            <h3>Learn one idea</h3>
            <p>
              A tiny explanation gives each task purpose before practice begins.
            </p>
          </article>
          <article className="principle-card mint">
            <span>02</span>
            <h3>Try it in real life</h3>
            <p>
              Reading, conversation, paper shapes and everyday maths keep
              learning tangible.
            </p>
          </article>
          <article className="principle-card gold">
            <span>03</span>
            <h3>Return only to reflect</h3>
            <p>
              Easy, okay or tricky helps tomorrow’s practice respond without
              judgement.
            </p>
          </article>
        </div>
      </section>

      <section className="journey-container next-step-panel">
        <div>
          <p className="eyebrow">Your family command centre</p>
          <h2>
            AE lessons, target schools and every important date - together.
          </h2>
        </div>
        <div className="next-step-actions">
          <Link className="journey-button navy" to="/parent">
            Open Parent Desk
          </Link>
          <Link className="text-link" to="/quiz">
            Open full practice
          </Link>
        </div>
      </section>
    </main>
  );
}
