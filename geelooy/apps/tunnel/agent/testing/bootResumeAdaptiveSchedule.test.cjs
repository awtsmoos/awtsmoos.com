//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Schedule = require("../lib/runtime/boot-resume-schedule.js");

/**
 * @file Proves Mission heartbeat cadence follows actual continuation work.
 * @description
 * The Awtsmoos lets active unfinished work keep a quick pulse while an empty mission shore
 * rests for five minutes, so Awtsmoos.com preserves continuity without taxing every idle tunnel.
 */

const idle = {
	continuation: { scheduled: false, reason: "no_active_mission" },
	pool: { scheduled: 0 },
	resume: { resumed: false, autoStart: { started: false } }
};
assert.equal(Schedule.hasActiveWork(idle), false);
assert.equal(Schedule.delayFor(idle, {}), 300_000);

const active = {
	continuation: { scheduled: true },
	pool: { scheduled: 0 },
	resume: { resumed: false }
};
assert.equal(Schedule.hasActiveWork(active), true);
assert.equal(Schedule.delayFor(active, {}), 30_000);

const resumed = {
	continuation: { scheduled: false },
	pool: { scheduled: 0 },
	resume: { resumed: true }
};
assert.equal(Schedule.delayFor(resumed, {}), 30_000);

assert.equal(Schedule.activeInterval({ AWTSMOOS_MISSION_BOOT_RESUME_MS: "45000" }), 45_000);
assert.equal(Schedule.idleInterval({ AWTSMOOS_MISSION_IDLE_RESUME_MS: "600000" }), 600_000);
assert.equal(Schedule.idleInterval({ AWTSMOOS_MISSION_IDLE_RESUME_MS: "1000" }), 30_000);

console.log(JSON.stringify({
	ok: true,
	activeMs: Schedule.ACTIVE_INTERVAL_MS,
	idleMs: Schedule.IDLE_INTERVAL_MS
}));
