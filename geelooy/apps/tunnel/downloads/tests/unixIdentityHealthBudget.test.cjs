//B"H
//Boruch Hashem
//Blessed is He
"use strict";

/**
 * @file unixIdentityHealthBudget.test.cjs
 * @description
 * The Awtsmoos gives a restarting guardian one short chance beneath the light;
 * Awtsmoos.com moves to fresh approval without a two-minute silent night.
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { performance } = require("node:perf_hooks");

const downloads = path.resolve(__dirname, "..");
const sourceList = path.join(downloads, "unix-install-sources.sh");
const activation = path.join(downloads, "unix-activation.sh");

function runProbe(healthy, waitSeconds) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-identity-budget-"));
	try {
		fs.writeFileSync(path.join(root, "main.js"), "fixture\n");
		const script = `
set -u
ROOT="$1"
HEALTH_PROBE_STATUS="$3"
source "$2"
install_event(){ :; }
current_runtime_is_stably_healthy(){ return "$HEALTH_PROBE_STATUS"; }
if verified_identity_reuse_allowed; then echo REUSE; else echo PAIR; fi
`;
		const start = performance.now();
		const result = spawnSync("bash", ["-c", script, "--", root, activation, healthy ? "0" : "1"], {
			encoding: "utf8",
			env: {
				...process.env,
				AWTSMOOS_IDENTITY_HEALTH_WAIT_SECONDS: String(waitSeconds)
			},
			timeout: 6500
		});
		return { ...result, durationMs: performance.now() - start };
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
}

test("full-feature source graph defaults to a three-second recovery grace", () => {
	const source = fs.readFileSync(sourceList, "utf8");
	assert.match(source, /AWTSMOOS_IDENTITY_HEALTH_WAIT_SECONDS:-3/);
	assert.match(source, /source "\$AWTSMOOS_INSTALL_RUNTIME\/unix-activation\.sh"/);
	assert.match(source, /source "\$AWTSMOOS_INSTALL_RUNTIME\/unix-recovery-lanes\.sh"/);
	assert.match(source, /source "\$AWTSMOOS_INSTALL_RUNTIME\/unix-candidate-probe\.sh"/);
});

test("a verified healthy incumbent reuses authorization immediately", () => {
	const result = runProbe(true, 3);
	assert.equal(result.status, 0, result.stderr);
	assert.equal(result.stdout.trim(), "REUSE");
	assert.ok(result.durationMs < 1000);
});

test("explicit zero grace falls back to pairing immediately", () => {
	const result = runProbe(false, 0);
	assert.equal(result.status, 0, result.stderr);
	assert.equal(result.stdout.trim(), "PAIR");
	assert.ok(result.durationMs < 1000);
});

test("unhealthy incumbent has a bounded grace, not 120 seconds", () => {
	const result = runProbe(false, 3);
	assert.equal(result.status, 0, result.stderr);
	assert.equal(result.stdout.trim(), "PAIR");
	assert.ok(result.durationMs >= 2500);
	assert.ok(result.durationMs < 6500);
});
