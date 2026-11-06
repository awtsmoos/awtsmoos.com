// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

/**
 * B"H 2026-11-06: the Nov 6 Mac installs failed twice identically because
 * (a) the installer killed agents that were alive and mid-registration,
 * resetting registration progress each time, and (b) the late-start grace
 * let a flickering candidate die even while samples were passing (Nov 4
 * reached rank 5 yet never held 4 consecutive samples). This suite proves
 * both fixes: a fresh registration_pending receipt counts as "registering,
 * do not kill", and passing samples extend the grace deadline.
 */
const downloads = path.resolve(import.meta.dirname, "..");
const health = path.join(downloads, "unix-fast-repair-health.sh");
const late = path.join(downloads, "unix-late-readiness.sh");

const nowIso = new Date().toISOString();
const staleIso = new Date(Date.now() - 600000).toISOString();

// --- Part A: registering_agent_pid ---------------------------------------
const registering = runRegistering({
	pendingFresh: `{"state":"registration_pending","pid":12345,"tunnelName":"awt-test","updatedAt":"${nowIso}"}`,
	connectingFresh: `{"state":"connecting","pid":12345,"tunnelName":"awt-test","lastServerMessageAt":"${nowIso}"}`,
	registered: `{"state":"registered","pid":12345,"tunnelName":"awt-test","updatedAt":"${nowIso}"}`,
	pendingStale: `{"state":"registration_pending","pid":12345,"tunnelName":"awt-test","updatedAt":"${staleIso}"}`
});
assert.equal(registering.pendingFresh, "12345", "fresh registration_pending must report the pid");
assert.equal(registering.connectingFresh, "12345", "fresh connecting must report the pid");
assert.equal(registering.registered, "", "a registered agent is not 'registering'");
assert.equal(registering.pendingStale, "", "a stale pending receipt is not 'registering'");

// --- Part B: late grace extends on passing samples ------------------------
const grace = runGrace();
assert.equal(grace.status, 0, "flapping candidate must stabilize once passing samples extend the deadline");
assert.match(grace.events, /Late candidate stabilized/);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-fast-repair-readiness",
	registeringAgentDetected: true,
	lateGraceExtendsOnPassingSamples: true
}, null, 2));

function runRegistering(cases) {
	const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-registering-"));
	const results = {};
	for (const [name, body] of Object.entries(cases)) {
		const script = `
ROOT='${temporary}'
AWTSMOOS_NODE_BIN='${process.execPath}'
printf '12345\\n' > "$ROOT/agent.pid"
printf '%s' '${body.replace(/'/g, `'\\''`)}' > "$ROOT/connection-state.json"
runtime_pid_matches() { [ "$1" = "12345" ]; }
source '${health}'
if pid="$(registering_agent_pid 2>/dev/null)"; then printf 'PID=%s\\n' "$pid"; else printf 'PID=\\n'; fi
`;
		const result = spawnSync("/bin/bash", ["-c", script], { encoding: "utf8" });
		assert.equal(result.status, 0, result.stderr);
		results[name] = result.stdout.match(/PID=(.*)/)?.[1] ?? "";
	}
	fs.rmSync(temporary, { recursive: true, force: true });
	return results;
}

function runGrace() {
	const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-late-grace-"));
	const clock = path.join(temporary, "clock");
	const calls = path.join(temporary, "calls");
	const events = path.join(temporary, "events");
	fs.writeFileSync(clock, "1000\n");
	fs.writeFileSync(calls, "0\n");
	// Calls 1, 4, 5, 6 fail; every other call passes. The old grace (extend
	// on rank advance only, base 5s) runs 4 loop samples then fails its
	// final sample; the fixed grace extends on each pass and reaches the
	// 4-consecutive-pass stability bar.
	const script = `
ROOT='${temporary}'
CANDIDATE_VERSION='9.9.9'
AWTSMOOS_LATE_START_GRACE_SECONDS=5
AWTSMOOS_LATE_START_PROGRESS_GRACE_SECONDS=10
AWTSMOOS_LATE_START_HARD_GRACE_SECONDS=30
CLOCK='${clock}'
CALLS='${calls}'
EVENTS='${events}'
date() { value="$(cat "$CLOCK")"; printf '%s\\n' "$((value + 1))" > "$CLOCK"; printf '%s\\n' "$value"; }
sleep() { :; }
install_event() { printf '%s %s %s\\n' "$1" "$2" "$3" >> "$EVENTS"; }
startup_phase() { printf 'supervisor_alive\\n'; }
startup_phase_rank() { printf '1\\n'; }
service_health_summary() { printf 'mode=portable\\n'; }
current_release_is_complete() { return 0; }
source '${late}'
# NB: override AFTER sourcing — the file itself defines this function.
late_candidate_ready_sample() {
	count="$(( $(cat "$CALLS") + 1 ))"
	printf '%s\\n' "$count" > "$CALLS"
	case "$count" in 1|4|5|6) return 1 ;; *) return 0 ;; esac
}
candidate_late_readiness_grace
printf 'STATUS=%s\\n' "$?"
`;
	const result = spawnSync("/bin/bash", ["-c", script], { encoding: "utf8", timeout: 15000 });
	const status = Number(result.stdout.match(/STATUS=(\d+)/)?.[1] ?? 1);
	const recorded = fs.existsSync(events) ? fs.readFileSync(events, "utf8") : "";
	fs.rmSync(temporary, { recursive: true, force: true });
	return { status, events: recorded };
}
