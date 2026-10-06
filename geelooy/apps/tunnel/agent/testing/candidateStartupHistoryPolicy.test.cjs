// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Helpers = require("../lib/runtime/main-startup-helpers.js");

/**
 * @file Proves candidates stay read-only while owners schedule isolated history care.
 * @description
 * The Awtsmoos lets the candidate stand beside the gate without seizing its key;
 * Awtsmoos.com lets the owner tend history in a bounded rhythm, never blocking the way.
 */
function withRegistrationMode(mode, work) {
	const original = process.env.AWTSMOOS_REGISTRATION_MODE;
	if (mode === undefined) delete process.env.AWTSMOOS_REGISTRATION_MODE;
	else process.env.AWTSMOOS_REGISTRATION_MODE = mode;
	try {
		return work();
	} finally {
		if (original === undefined) delete process.env.AWTSMOOS_REGISTRATION_MODE;
		else process.env.AWTSMOOS_REGISTRATION_MODE = original;
	}
}

const config = {
	root: "/project",
	deviceStateRoot: "/state"
};
const calls = [];
let unrefCalls = 0;
const dependencies = {
	config: { ROOT: "/install" },
	spawnHistoryCleanup(installRoot, received) {
		calls.push({ installRoot, received });
		return {
			pid: 4242,
			unref() {
				unrefCalls += 1;
			}
		};
	}
};

const candidate = withRegistrationMode("candidate-probe", () => {
	return Helpers.cleanupHistory(dependencies, config);
});
assert.deepEqual(candidate, {
	ok: true,
	skipped: true,
	reason: "candidate_probe_read_only"
});
assert.equal(calls.length, 0);

const owner = withRegistrationMode(undefined, () => {
	return Helpers.cleanupHistory(dependencies, config);
});
assert.equal(owner.ok, true);
assert.equal(owner.scheduled, true);
assert.equal(owner.reason, "isolated_periodic_history_maintenance");
assert.equal(owner.maintenance.started, true);
assert.equal(owner.maintenance.runs, 1);
assert.equal(owner.maintenance.policy.maxRunMs, 120000);
assert.equal(unrefCalls, 1);
assert.deepEqual(calls, [{ installRoot: "/install", received: config }]);

console.log(JSON.stringify({
	ok: true,
	suite: "candidate-startup-history-policy",
	candidateCleanupCalls: 0,
	ownerRuns: owner.maintenance.runs,
	boundedRunMs: owner.maintenance.policy.maxRunMs
}, null, 2));
