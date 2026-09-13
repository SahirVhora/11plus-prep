import assert from "node:assert/strict";
import test from "node:test";

import {
  FGP36_SESSIONS,
  MISSIONS,
  SCHOOL_ROUTES,
} from "../src/features/journey/data.ts";
import {
  buildCourseCalendar,
  createInitialJourneyState,
  getCourseProgress,
  getKendrickEligibility,
  getNextSession,
  getTodayMission,
  normaliseJourneyState,
  normaliseOutwardPostcode,
} from "../src/features/journey/model.ts";

test("FGP36 calendar contains 40 unique Sunday sessions in chronological order", () => {
  assert.equal(FGP36_SESSIONS.length, 40);
  assert.equal(new Set(FGP36_SESSIONS.map((session) => session.date)).size, 40);
  assert.deepEqual(
    [...FGP36_SESSIONS].sort((a, b) => a.date.localeCompare(b.date)),
    FGP36_SESSIONS,
  );
  for (const session of FGP36_SESSIONS) {
    assert.equal(new Date(`${session.date}T12:00:00`).getDay(), 0);
  }
});

test("next-session and progress calculations handle boundaries", () => {
  assert.equal(getNextSession(new Date("2026-09-06T08:00:00"))?.number, 1);
  assert.equal(
    getNextSession(new Date("2026-10-25T12:00:00"))?.number,
    8,
    "half term skips to 1 November",
  );
  assert.equal(getNextSession(new Date("2027-08-30T12:00:00")), null);
  assert.equal(
    getCourseProgress(new Date("2026-09-06T18:00:00")),
    0,
    "today is not counted as complete until tomorrow",
  );
  assert.equal(getCourseProgress(new Date("2027-08-30T12:00:00")), 100);
});

test("course calendar exports every session with a reminder", () => {
  const calendar = buildCourseCalendar();
  assert.equal((calendar.match(/BEGIN:VEVENT/g) ?? []).length, 40);
  assert.equal((calendar.match(/BEGIN:VALARM/g) ?? []).length, 40);
  assert.match(calendar, /DTSTART:20260906T123000/);
  assert.match(calendar, /DTEND:20270829T150000/);
  assert.match(calendar, /Parents join the final 30 minutes/);
});

test("Kendrick preliminary check is conservative for partial sectors and Feltham", () => {
  assert.equal(normaliseOutwardPostcode(" rg2 9 "), "RG29");
  assert.equal(getKendrickEligibility("RG2"), "unknown");
  assert.equal(getKendrickEligibility("RG2 9"), "likely-in-area");
  assert.equal(getKendrickEligibility("SL6"), "unknown");
  assert.equal(getKendrickEligibility("SL6 4"), "likely-in-area");
  assert.equal(getKendrickEligibility("TW13"), "outside-area");
  assert.equal(getKendrickEligibility(""), "unknown");
});

test("import normalisation rejects malformed nested data and unknown schools", () => {
  const state = normaliseJourneyState({
    childName: "legacy value must be discarded",
    outwardPostcode: " tw13 ",
    selectedSchoolIds: ["slough", "slough", "made-up"],
    completedMissions: {
      valid: { completedAt: "2026-09-13T10:00:00Z", confidence: "okay" },
      invalid: { completedAt: 4, confidence: "amazing" },
    },
    homework: [
      {
        id: "h1",
        date: "2026-09-13",
        subject: "maths",
        book: "Book 1",
        pages: "1-4",
        note: "",
        complete: false,
      },
      { id: "bad", subject: "unknown" },
    ],
    assessments: [
      {
        id: "a1",
        date: "2026-09-13",
        subject: "mixed",
        score: 8,
        total: 10,
        note: "",
      },
      { id: "bad", date: "", subject: "maths", score: 11, total: 10, note: "" },
    ],
  });

  assert.equal("childName" in state, false);
  assert.equal(state.outwardPostcode, "TW13");
  assert.deepEqual(state.selectedSchoolIds, ["slough"]);
  assert.deepEqual(Object.keys(state.completedMissions), ["valid"]);
  assert.equal(state.homework.length, 1);
  assert.equal(state.assessments.length, 1);
});

test("journey defaults and daily missions are complete and stable", () => {
  const initial = createInitialJourneyState();
  assert.deepEqual(
    initial.selectedSchoolIds,
    SCHOOL_ROUTES.map((school) => school.id),
  );
  assert.ok(MISSIONS.length >= 12);
  assert.equal(
    getTodayMission(new Date("2026-09-13T00:01:00")).id,
    getTodayMission(new Date("2026-09-13T23:59:00")).id,
  );
  for (const mission of MISSIONS) {
    assert.ok(mission.minutes <= 10);
    assert.equal(mission.steps.length, 3);
    assert.ok(mission.offlineChallenge.length > 20);
  }
});
