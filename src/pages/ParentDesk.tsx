import { type ChangeEvent, type FormEvent, useMemo, useState } from "react";
import {
  downloadCourseCalendar,
  exportJourney,
  requestJourneyNotifications,
} from "../features/journey/browser";
import { SCHOOL_ROUTES, SUBJECT_LABELS } from "../features/journey/data";
import { getKendrickEligibility } from "../features/journey/model";
import type { JourneySubject } from "../features/journey/types";
import { useJourney } from "../features/journey/useJourney";

const SUBJECTS = Object.entries(SUBJECT_LABELS) as Array<
  [JourneySubject, string]
>;

function today() {
  return new Date().toISOString().slice(0, 10);
}

function scorePercent(score: number, total: number) {
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

export function ParentDesk() {
  const journeyApi = useJourney();
  const { journey } = journeyApi;
  const [outwardPostcode, setOutwardPostcode] = useState(
    journey.outwardPostcode,
  );
  const [homework, setHomework] = useState({
    date: today(),
    subject: "maths" as JourneySubject,
    book: "",
    pages: "",
    note: "",
  });
  const [assessment, setAssessment] = useState({
    date: today(),
    subject: "mixed" as JourneySubject | "mixed",
    score: "",
    total: "",
    note: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const openHomework = journey.homework.filter((entry) => !entry.complete);
  const trickyMissions = Object.entries(journey.completedMissions).filter(
    ([, completion]) => completion.confidence === "tricky",
  ).length;
  const assessmentAverage = useMemo(() => {
    if (!journey.assessments.length) return null;
    return Math.round(
      journey.assessments.reduce(
        (sum, item) => sum + scorePercent(item.score, item.total),
        0,
      ) / journey.assessments.length,
    );
  }, [journey.assessments]);
  const kendrick = getKendrickEligibility(journey.outwardPostcode);

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    journeyApi.updateProfile(outwardPostcode);
    setMessage("School area saved on this device.");
    setError("");
  };

  const saveHomework = (event: FormEvent) => {
    event.preventDefault();
    if (!homework.book.trim() || !homework.pages.trim()) {
      setError("Add the book and page range before saving homework.");
      return;
    }
    journeyApi.addHomework({
      ...homework,
      book: homework.book.trim(),
      pages: homework.pages.trim(),
      note: homework.note.trim(),
      complete: false,
    });
    setHomework((current) => ({ ...current, book: "", pages: "", note: "" }));
    setMessage("Homework added to the weekly plan.");
    setError("");
  };

  const saveAssessment = (event: FormEvent) => {
    event.preventDefault();
    const score = Number(assessment.score);
    const total = Number(assessment.total);
    if (
      !Number.isInteger(score) ||
      !Number.isInteger(total) ||
      total < 1 ||
      score < 0 ||
      score > total
    ) {
      setError("Enter whole numbers with a score between zero and the total.");
      return;
    }
    journeyApi.addAssessment({
      date: assessment.date,
      subject: assessment.subject,
      score,
      total,
      note: assessment.note.trim(),
    });
    setAssessment((current) => ({
      ...current,
      score: "",
      total: "",
      note: "",
    }));
    setMessage("Assessment recorded. Use the trend as evidence, not pressure.");
    setError("");
  };

  const enableNotifications = async () => {
    const result = await requestJourneyNotifications();
    journeyApi.setNotificationsEnabled(result === "enabled");
    if (result === "enabled")
      setMessage(
        "Browser reminders enabled while the app is open. Add the calendar for closed-app alerts.",
      );
    if (result === "denied")
      setError(
        "Notifications were not enabled. You can change permission in browser settings or use calendar reminders.",
      );
    if (result === "unsupported")
      setError(
        "This browser does not support notifications. Calendar reminders will still work.",
      );
  };

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 1_000_000)
        throw new Error("Backup is unexpectedly large.");
      journeyApi.importJourney(await file.text());
      setMessage("Backup restored successfully.");
      setError("");
    } catch {
      setError(
        "That file is not a valid Grammar Journey backup. Nothing was changed.",
      );
    } finally {
      event.target.value = "";
    }
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset all local journey data on this device? Export a backup first if you may need it.",
      )
    )
      return;
    journeyApi.resetJourney();
    setOutwardPostcode("");
    setMessage("Journey data reset on this device.");
    setError("");
  };

  return (
    <main className="journey-page pale-page parent-page">
      <section className="journey-container inner-hero parent-hero">
        <div>
          <p className="eyebrow">Private family space</p>
          <h1>Parent Desk</h1>
          <p>
            Plan the week, notice patterns and keep administration away from
            learning time.
          </p>
        </div>
        <div className="privacy-seal">
          <span>⌂</span>
          <strong>Stored locally</strong>
          <small>No child account or cloud profile</small>
        </div>
      </section>

      {(message || error) && (
        <div
          className={`journey-container notice ${error ? "notice-error" : "notice-success"}`}
          role="status"
        >
          {error || message}
        </div>
      )}

      <section className="journey-container parent-stats">
        <article>
          <strong>{openHomework.length}</strong>
          <span>open homework items</span>
        </article>
        <article>
          <strong>
            {assessmentAverage === null ? "—" : `${assessmentAverage}%`}
          </strong>
          <span>recorded assessment average</span>
        </article>
        <article>
          <strong>{trickyMissions}</strong>
          <span>missions marked tricky</span>
        </article>
      </section>

      <section className="journey-container parent-grid">
        <article className="premium-panel parent-panel">
          <p className="eyebrow">School-area check</p>
          <h2>Keep personal data minimal</h2>
          <form onSubmit={saveProfile} className="stack-form">
            <label>
              Postcode district or sector
              <input
                value={outwardPostcode}
                maxLength={7}
                onChange={(event) =>
                  setOutwardPostcode(event.target.value.toUpperCase())
                }
                placeholder="e.g. TW13 or RG2 9"
              />
            </label>
            <p className="field-help">
              Only this partial postcode is stored on this device for a
              preliminary Kendrick area check. No learner name is collected.
              Always confirm with the school.
            </p>
            <button className="journey-button navy" type="submit">
              Save area
            </button>
          </form>
          {journey.outwardPostcode && (
            <div className={`eligibility-note ${kendrick}`}>
              Kendrick check:{" "}
              {kendrick === "likely-in-area"
                ? "may be in the currently published area"
                : kendrick === "outside-area"
                  ? "appears outside the currently published area"
                  : "more postcode detail is needed"}
              .
            </div>
          )}
        </article>

        <article className="premium-panel parent-panel">
          <p className="eyebrow">Reminders</p>
          <h2>Never miss the useful things</h2>
          <p>
            Calendar alerts work when the website is closed. Browser reminders
            work only while the app is active.
          </p>
          <div className="button-stack">
            <button
              className="journey-button coral"
              onClick={downloadCourseCalendar}
            >
              Download FGP36 calendar
            </button>
            <button className="soft-button" onClick={enableNotifications}>
              {journey.notificationsEnabled
                ? "Browser reminders enabled ✓"
                : "Enable browser reminders"}
            </button>
          </div>
        </article>
      </section>

      <section className="journey-container parent-grid">
        <article className="premium-panel parent-panel">
          <p className="eyebrow">Weekly work</p>
          <h2>Add AE homework</h2>
          <form onSubmit={saveHomework} className="stack-form compact-form">
            <div className="form-row">
              <label>
                Date
                <input
                  type="date"
                  value={homework.date}
                  onChange={(event) =>
                    setHomework({ ...homework, date: event.target.value })
                  }
                />
              </label>
              <label>
                Subject
                <select
                  value={homework.subject}
                  onChange={(event) =>
                    setHomework({
                      ...homework,
                      subject: event.target.value as JourneySubject,
                    })
                  }
                >
                  {SUBJECTS.map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-row">
              <label>
                Book
                <input
                  value={homework.book}
                  onChange={(event) =>
                    setHomework({ ...homework, book: event.target.value })
                  }
                  placeholder="Maths workbook 1"
                />
              </label>
              <label>
                Pages
                <input
                  value={homework.pages}
                  onChange={(event) =>
                    setHomework({ ...homework, pages: event.target.value })
                  }
                  placeholder="12-18"
                />
              </label>
            </div>
            <label>
              Anything to tell the teacher?
              <textarea
                value={homework.note}
                onChange={(event) =>
                  setHomework({ ...homework, note: event.target.value })
                }
                placeholder="Equivalent fractions needed extra help"
              />
            </label>
            <button className="journey-button navy" type="submit">
              Add homework
            </button>
          </form>
        </article>

        <article className="premium-panel parent-panel">
          <p className="eyebrow">Evidence, not pressure</p>
          <h2>Record a class test or mock</h2>
          <form onSubmit={saveAssessment} className="stack-form compact-form">
            <div className="form-row">
              <label>
                Date
                <input
                  type="date"
                  value={assessment.date}
                  onChange={(event) =>
                    setAssessment({ ...assessment, date: event.target.value })
                  }
                />
              </label>
              <label>
                Subject
                <select
                  value={assessment.subject}
                  onChange={(event) =>
                    setAssessment({
                      ...assessment,
                      subject: event.target.value as JourneySubject | "mixed",
                    })
                  }
                >
                  <option value="mixed">Mixed</option>
                  {SUBJECTS.map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="form-row">
              <label>
                Score
                <input
                  inputMode="numeric"
                  value={assessment.score}
                  onChange={(event) =>
                    setAssessment({ ...assessment, score: event.target.value })
                  }
                  placeholder="18"
                />
              </label>
              <label>
                Out of
                <input
                  inputMode="numeric"
                  value={assessment.total}
                  onChange={(event) =>
                    setAssessment({ ...assessment, total: event.target.value })
                  }
                  placeholder="25"
                />
              </label>
            </div>
            <label>
              Note
              <textarea
                value={assessment.note}
                onChange={(event) =>
                  setAssessment({ ...assessment, note: event.target.value })
                }
                placeholder="Rushed the final two questions"
              />
            </label>
            <button className="journey-button navy" type="submit">
              Record result
            </button>
          </form>
        </article>
      </section>

      <section className="journey-container records-grid">
        <article className="premium-panel record-panel">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">Homework list</p>
              <h2>This week’s work</h2>
            </div>
            <span>{journey.homework.length} items</span>
          </div>
          {!journey.homework.length ? (
            <p className="empty-state">
              Add the first AE assignment above. Keep the books as the main
              programme.
            </p>
          ) : (
            <div className="record-list">
              {journey.homework.map((entry) => (
                <div
                  key={entry.id}
                  className={entry.complete ? "complete" : ""}
                >
                  <button
                    className="check-button"
                    aria-label={
                      entry.complete
                        ? "Mark homework incomplete"
                        : "Mark homework complete"
                    }
                    onClick={() => journeyApi.toggleHomework(entry.id)}
                  >
                    {entry.complete ? "✓" : ""}
                  </button>
                  <div>
                    <strong>
                      {SUBJECT_LABELS[entry.subject]} · {entry.book}
                    </strong>
                    <p>
                      Pages {entry.pages}
                      {entry.note ? ` · ${entry.note}` : ""}
                    </p>
                  </div>
                  <button
                    className="delete-button"
                    aria-label="Remove homework"
                    onClick={() => journeyApi.removeHomework(entry.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </article>
        <article className="premium-panel record-panel">
          <div className="panel-title-row">
            <div>
              <p className="eyebrow">Score history</p>
              <h2>Progress evidence</h2>
            </div>
            <span>{journey.assessments.length} results</span>
          </div>
          {!journey.assessments.length ? (
            <p className="empty-state">
              Wait for AE’s baseline and class tests. There is no need to add
              another diagnostic now.
            </p>
          ) : (
            <div className="record-list">
              {journey.assessments.map((entry) => (
                <div key={entry.id}>
                  <div className="score-orb">
                    {scorePercent(entry.score, entry.total)}%
                  </div>
                  <div>
                    <strong>
                      {entry.subject === "mixed"
                        ? "Mixed assessment"
                        : SUBJECT_LABELS[entry.subject]}
                    </strong>
                    <p>
                      {entry.score}/{entry.total}
                      {entry.note ? ` · ${entry.note}` : ""}
                    </p>
                  </div>
                  <button
                    className="delete-button"
                    aria-label="Remove assessment"
                    onClick={() => journeyApi.removeAssessment(entry.id)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="journey-container school-checklist premium-panel">
        <div>
          <p className="eyebrow">Schools in view</p>
          <h2>Follow only the routes your family may use</h2>
        </div>
        <div>
          {SCHOOL_ROUTES.map((school) => (
            <label key={school.id}>
              <input
                type="checkbox"
                checked={journey.selectedSchoolIds.includes(school.id)}
                onChange={() => journeyApi.toggleSchool(school.id)}
              />
              <span>
                <strong>{school.name}</strong>
                <small>{school.status}</small>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="journey-container data-safety">
        <div>
          <h2>Your data stays yours</h2>
          <p>
            Export before changing browser or device. Import validates the
            structure and ignores unsupported school selections.
          </p>
        </div>
        <div className="data-actions">
          <button
            className="soft-button"
            onClick={() => exportJourney(journey)}
          >
            Export backup
          </button>
          <label className="soft-button file-button">
            Import backup
            <input
              type="file"
              accept="application/json,.json"
              onChange={importBackup}
            />
          </label>
          <button className="danger-button" onClick={reset}>
            Reset local data
          </button>
        </div>
      </section>
    </main>
  );
}
