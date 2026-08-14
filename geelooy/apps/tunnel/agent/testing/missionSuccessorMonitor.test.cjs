// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Boot = require("../lib/runtime/boot-resume-loop.js");
const Eligibility = require("../tools/fs/mission/autoContinuation/eligibility.js");

/**
 * @file Proves one unfinished mission is watched quickly without mistaking a living agent for a corpse.
 * @description The Awtsmoos lets a messenger vanish while the mission remains; Awtsmoos.com checks often,
 * trusts recent living heartbeats, ignores ended-agent freshness, and still obeys pause and candidate gates.
 */
test("successor monitor cadence is fast but bounded", () => {
	assert.equal(Boot.interval({}), 30000);
	assert.equal(Boot.interval({ AWTSMOOS_MISSION_BOOT_RESUME_MS: "1" }), 15000);
	assert.equal(Boot.interval({ AWTSMOOS_MISSION_BOOT_RESUME_MS: "45000" }), 45000);
	assert.equal(Boot.interval({ AWTSMOOS_MISSION_BOOT_RESUME_MS: "9999999" }), 300000);
	assert.equal(Boot.interval({ AWTSMOOS_MISSION_BOOT_RESUME_MS: "broken" }), 30000);
	assert.equal(Boot.enabled({ AWTSMOOS_REGISTRATION_MODE: "candidate-probe" }), false);
});

test("recent living heartbeat suppresses succession", () => {
	const now = Date.now();
	assert.equal(Eligibility.decide(fixture(now, "active", now - 10000)).reason, "mission_still_active");
});

test("stale living agent allows continuation", () => {
	const now = Date.now();
	assert.deepEqual(Eligibility.decide(fixture(now, "active", now - 180000)), {
		eligible: true,
		reason: "unfinished_mission_idle"
	});
});

test("recent ended agent no longer impersonates fresh work", () => {
	const now = Date.now();
	for (const status of ["completed", "stopped", "recovered_by_peer", "failed", "dead", "offline"]) {
		const input = fixture(now, status, now - 1000);
		assert.equal(Eligibility.freshWork(input.mission, input.lock, now), false, status);
		assert.equal(Eligibility.decide(input).eligible, true, status);
	}
});

test("pause and candidate gates remain absolute", () => {
	const now = Date.now();
	const paused = fixture(now, "active", now - 180000);
	paused.mission.paused = true;
	assert.equal(Eligibility.decide(paused).reason, "mission_paused_or_stopped");
	assert.equal(Eligibility.decide({ ...paused, candidateProbe: true }).reason, "candidate_probe_suppressed");
});

function fixture(now, status, lastSeenMs) {
	const oldAt = new Date(now - 180000).toISOString();
	return {
		now,
		mission: {
			id: "mission-successor-monitor",
			status: "active",
			room: { agents: { worker: { agentId: "worker", status, lastSeenAt: new Date(lastSeenMs).toISOString() } } }
		},
		lock: {
			missionId: "mission-successor-monitor",
			startedAt: oldAt,
			updatedAt: oldAt,
			lastAction: "missionBootResume",
			lastMustCallNext: { action: "missionStepExecute" }
		}
	};
}
