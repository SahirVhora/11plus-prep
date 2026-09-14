import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const contextUrl = new URL("../src/context/AppContext.tsx", import.meta.url);
const settingsUrl = new URL(
  "../src/components/layout/SettingsModal.tsx",
  import.meta.url,
);
const clientUrl = new URL("../src/api/generateQuestions.ts", import.meta.url);

test("provider credentials are never collected, stored or sent by the browser", async () => {
  const [context, settings, client] = await Promise.all([
    readFile(contextUrl, "utf8"),
    readFile(settingsUrl, "utf8"),
    readFile(clientUrl, "utf8"),
  ]);

  assert.doesNotMatch(settings, /type=["']password["']/i);
  assert.doesNotMatch(settings, /value=\{state\.apiKey\}|SET_API_KEY/);
  assert.match(
    context,
    /sessionStorage\.removeItem\(API_KEY_SESSION_STORAGE_KEY\)/,
  );
  assert.doesNotMatch(client, /apiKey\s*:/);
  assert.match(client, /"X-Worksheet-Access": params\.accessCode/);
  assert.match(client, /provider: params\.provider/);
  assert.match(client, /model: params\.model/);
});
