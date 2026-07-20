import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const contextUrl = new URL("../src/context/AppContext.tsx", import.meta.url);

test("API keys are session-only and excluded from persisted application settings", async () => {
  const source = await readFile(contextUrl, "utf8");

  assert.match(
    source,
    /sessionStorage\.getItem\(API_KEY_SESSION_STORAGE_KEY\)/,
  );
  assert.match(
    source,
    /sessionStorage\.setItem\(API_KEY_SESSION_STORAGE_KEY,\s*state\.apiKey\)/,
  );
  assert.doesNotMatch(
    source,
    /const toSave\s*=\s*\{[\s\S]*?apiKey\s*:/,
    "localStorage settings must not include apiKey",
  );
});
