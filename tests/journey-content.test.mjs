import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const files = {
  app: new URL("../src/App.tsx", import.meta.url),
  home: new URL("../src/pages/Home.tsx", import.meta.url),
  parent: new URL("../src/pages/ParentDesk.tsx", import.meta.url),
  manifest: new URL("../public/site.webmanifest", import.meta.url),
  worker: new URL("../public/sw.js", import.meta.url),
};

const privacyFiles = [
  new URL("../README.md", import.meta.url),
  new URL("../src/features/journey/browser.ts", import.meta.url),
  new URL("../src/features/journey/data.ts", import.meta.url),
  new URL("../src/features/journey/model.ts", import.meta.url),
  new URL("../src/pages/Home.tsx", import.meta.url),
  new URL("../src/pages/Journey.tsx", import.meta.url),
  new URL("../src/pages/ParentDesk.tsx", import.meta.url),
];

test("the three core routes are wired into the application", async () => {
  const source = await readFile(files.app, "utf8");
  assert.match(source, /path="\/"/);
  assert.match(source, /path="\/journey"/);
  assert.match(source, /path="\/parent"/);
});

test("child experience has one clear mission and an off-screen step", async () => {
  const source = await readFile(files.home, "utf8");
  assert.match(source, /data-testid="start-mission"/);
  assert.match(source, /Now leave the screen/);
  assert.match(source, /Easy/);
  assert.match(source, /Okay/);
  assert.match(source, /Tricky/);
});

test("parent controls include validation, backup, reminders and reset confirmation", async () => {
  const source = await readFile(files.parent, "utf8");
  assert.match(source, /score > total/);
  assert.match(source, /exportJourney/);
  assert.match(source, /importJourney/);
  assert.match(source, /window\.confirm/);
  assert.match(source, /downloadCourseCalendar/);
  assert.match(source, /requestJourneyNotifications/);
});

test("installable app metadata and offline fallback are present", async () => {
  const manifest = JSON.parse(await readFile(files.manifest, "utf8"));
  const worker = await readFile(files.worker, "utf8");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/11plus-prep/");
  assert.match(worker, /caches\.match/);
  assert.match(worker, /event\.request\.mode === ["']navigate["']/);
});

test("public journey content does not collect or render a learner name", async () => {
  const source = (
    await Promise.all(privacyFiles.map((file) => readFile(file, "utf8")))
  ).join("\n");
  assert.doesNotMatch(source, /Learner’s first name/i);
  assert.doesNotMatch(source, /journey\.childName|profile\.childName/i);
});
