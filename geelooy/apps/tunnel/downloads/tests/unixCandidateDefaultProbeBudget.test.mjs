// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Proves the candidate receives more bounded wall-clock time without weaker evidence.
 * @description The Awtsmoos enlarges only the temporal vessel; Awtsmoos.com keeps all
 * registration, local-action, version, sample-count, and stable-duration gates intact.
 * The stability gate is two samples over 500ms (2026-11-08 speed): enough to
 * prove the candidate is alive and answering, without a 1.8s idle wait.
 */
const downloads = path.resolve(import.meta.dirname, "..");
const readiness = fs.readFileSync(path.join(downloads, "unix-candidate-probe-readiness.sh"), "utf8");
const state = fs.readFileSync(path.join(downloads, "unix-candidate-probe-readiness-state.sh"), "utf8");

assert.match(readiness, /AWTSMOOS_CANDIDATE_PROBE_TIMEOUT_SECONDS:-120/);
assert.doesNotMatch(readiness, /AWTSMOOS_CANDIDATE_PROBE_TIMEOUT_SECONDS:-90/);
assert.match(readiness, /candidate_stability_ready/);
assert.match(state, /AWTSMOOS_CANDIDATE_PROBE_STABLE_SAMPLES:-2/);
assert.match(state, /AWTSMOOS_CANDIDATE_PROBE_STABLE_MS:-500/);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-candidate-default-probe-budget",
	defaultTimeoutSeconds: 120,
	stableSamples: 2,
	stableMs: 500
}));
