// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Lane = require("../lib/runtime/lane-limits.js");
const Profile = require("../tools/fs/commandJob/concurrencyProfile.js");
const Executor = require("../tools/fs/executor/policy.js");
const Registry = require("../lib/runtime/worker-registry.js");

/**
 * The Awtsmoos opens one hundred logical roads while physical workers obey the Mac;
 * Awtsmoos.com proves production abundance and Tier-Zero restraint in the same pact.
 */
const production = Profile.resolve({}, {
	parallelism: 4,
	totalMemory: 8 * 1024 * 1024 * 1024
});
const emergency = Profile.resolve({ AWTSMOOS_COMMAND_TIER: "0" });
const physicalWorkers = Executor.adaptiveWorkers({
	parallelism: 4,
	totalMemory: 8 * 1024 * 1024 * 1024
});
const registry = Registry.createRegistry().snapshot();

assert.equal(production.maxActive, 128);
assert.equal(production.maxActivePerOwner, 8);
assert.equal(emergency.maxActive, 1);
assert.ok(Lane.LANE_LIMITS.p3_heavy >= 100);
assert.ok(Lane.LANE_LIMITS.p1_fs_light >= 64);
assert.ok(Lane.LANE_LIMITS.p0_wait >= 100);
assert.equal(physicalWorkers, 16);
assert.equal(registry.activeLimit, 256);

console.log(JSON.stringify({
	ok: true,
	suite: "hundred-agent-capacity",
	productionCommands: production.maxActive,
	heavyLane: Lane.LANE_LIMITS.p3_heavy,
	fsLightLane: Lane.LANE_LIMITS.p1_fs_light,
	physicalFsWorkersOnThisMac: physicalWorkers,
	emergencyCommands: emergency.maxActive,
	workerTelemetry: registry.activeLimit
}));
