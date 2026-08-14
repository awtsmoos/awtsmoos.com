// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * The Awtsmoos lets synthetic time reveal the readiness covenant without touching a living tunnel;
 * Awtsmoos.com proves exact stability arithmetic without confusing host scheduler pressure for candidate failure.
 */
const repositoryRoot = process.cwd();
const downloadsRoot = path.join(repositoryRoot, "geelooy/apps/tunnel/downloads");
const stateScript = path.join(downloadsRoot, "unix-candidate-probe-readiness-state.sh");
const readinessScript = path.join(downloadsRoot, "unix-candidate-probe-readiness.sh");

const stable = runScenario("stable", stableEvidence());
assert.equal(stable.result.status, 0, stable.result.stderr);
assertReady(stable.receipt);
assert.equal(stable.receipt.elapsedMs, 900);
assert.equal(stable.pairingExtended, false);

const flapping = runScenario("flapping", flappingEvidence());
assert.equal(flapping.result.status, 0, flapping.result.stderr);
assertReady(flapping.receipt);
assert.equal(flapping.receipt.elapsedMs, 1100);

const dead = runScenario("dead", deadEvidence());
assert.notEqual(dead.result.status, 0);
assert.equal(dead.receipt.state, "candidate_exited");
assert.equal(dead.receipt.reason, "candidate_alive");
assert.equal(dead.receipt.elapsedMs, 100);

assert.equal(candidateSleep(0), "0.10");
assert.equal(candidateSleep(2500), "0.25");
assert.equal(candidateSleep(12000), "0.50");

console.log(JSON.stringify({
	ok: true,
	suite: "unix-candidate-readiness-timing",
	stableElapsedMs: stable.receipt.elapsedMs,
	flappingElapsedMs: flapping.receipt.elapsedMs,
	deadElapsedMs: dead.receipt.elapsedMs,
	readonlyNeverPairs: true
}, null, 2));

function assertReady(receipt) {
	assert.equal(receipt.state, "ready");
	assert.equal(receipt.expectedVersion, "9.9.9");
	assert.equal(receipt.activationId, "activation-test");
	assert.equal(receipt.stableSamples >= 3, true);
	assert.equal(receipt.stableDurationMs >= 800, true);
	assert.equal(receipt.registered, true);
	assert.equal(receipt.localActionReady, true);
	assert.equal(receipt.versionReady, true);
}

function runScenario(name, evidenceBody) {
	const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), `awts-readiness-${name}-`));
	const marker = path.join(sandbox, "pairing-called");
	const shell = `${shellPrelude(sandbox, marker)}\n${evidenceBody}\nwait_for_candidate_probe`;
	const result = spawnSync("bash", ["-c", shell], { encoding: "utf8", timeout: 30000 });
	const receipt = JSON.parse(fs.readFileSync(path.join(sandbox, "candidate-readiness.json"), "utf8"));
	const pairingExtended = fs.existsSync(marker);
	fs.rmSync(sandbox, { recursive: true, force: true });
	return { pairingExtended, receipt, result };
}

function shellPrelude(sandbox, marker) {
	return `
AWTSMOOS_NODE_BIN="${process.execPath}"
CANDIDATE_ROOT="${sandbox}"
CANDIDATE_VERSION="9.9.9"
AWTSMOOS_ACTIVATION_ID="activation-test"
CANDIDATE_IDENTITY_AUTHORITY="readonly"
AWTSMOOS_CANDIDATE_PROBE_TIMEOUT_SECONDS=5
AWTSMOOS_CANDIDATE_PROBE_STABLE_SAMPLES=3
AWTSMOOS_CANDIDATE_PROBE_STABLE_MS=800
printf '1000' > "$CANDIDATE_ROOT/clock-ms"
source "${stateScript}"
source "${readinessScript}"
candidate_now_ms() { local value="$(cat "$CANDIDATE_ROOT/clock-ms")"; printf '%s' "$((value + 100))" > "$CANDIDATE_ROOT/clock-ms"; printf '%s\\n' "$value"; }
sleep() { :; }
install_event() { :; }
extend_candidate_deadline_for_pairing() { printf touched > "${marker}"; printf '%s\\n' "$1"; }
`;
}

function stableEvidence() {
	return `candidate_probe_evidence_sample() { export CANDIDATE_EVIDENCE_ALIVE=1 CANDIDATE_EVIDENCE_REGISTERED=1 CANDIDATE_EVIDENCE_ACTION=1 CANDIDATE_EVIDENCE_VERSION=1; CANDIDATE_LAST_FAILURE_LANE=ready; return 0; }`;
}

function flappingEvidence() {
	return `probe_count=0
candidate_probe_evidence_sample() {
	probe_count=$((probe_count + 1))
	export CANDIDATE_EVIDENCE_ALIVE=1 CANDIDATE_EVIDENCE_REGISTERED=1 CANDIDATE_EVIDENCE_ACTION=1 CANDIDATE_EVIDENCE_VERSION=1
	if [ "$probe_count" -eq 2 ]; then CANDIDATE_LAST_FAILURE_LANE=local_action; CANDIDATE_EVIDENCE_ACTION=0; export CANDIDATE_EVIDENCE_ACTION; return 1; fi
	CANDIDATE_LAST_FAILURE_LANE=ready
	return 0
}`;
}

function deadEvidence() {
	return `candidate_probe_evidence_sample() { export CANDIDATE_EVIDENCE_ALIVE=0 CANDIDATE_EVIDENCE_REGISTERED=0 CANDIDATE_EVIDENCE_ACTION=0 CANDIDATE_EVIDENCE_VERSION=0; CANDIDATE_LAST_FAILURE_LANE=candidate_alive; return 1; }`;
}

function candidateSleep(elapsedMs) {
	const command = `AWTSMOOS_NODE_BIN="${process.execPath}"; source "${stateScript}"; candidate_probe_sleep_seconds ${elapsedMs}`;
	const result = spawnSync("bash", ["-c", command], { encoding: "utf8" });
	assert.equal(result.status, 0, result.stderr);
	return result.stdout.trim();
}
