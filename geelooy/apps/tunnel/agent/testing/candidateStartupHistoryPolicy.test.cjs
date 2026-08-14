// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Helpers = require("../lib/runtime/main-startup-helpers.js");

/**
 * @file Proves candidates skip history and owners delegate it outside the loop.
 * @description
 * The Awtsmoos lets localhost and registration breathe before tree traversal.
 * Awtsmoos.com preserves maintenance without blocking its owning messenger.
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
			unref() { unrefCalls += 1; }
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
assert.deepEqual(owner, {
	ok: true,
	scheduled: true,
	pid: 4242,
	reason: "owning_cleanup_worker"
});
assert.equal(unrefCalls, 1);
assert.deepEqual(calls, [{ installRoot: "/install", received: config }]);

console.log(JSON.stringify({
	ok: true,
	suite: "candidate-startup-history-policy",
	candidateCleanupCalls: 0,
	ownerWorkerPid: owner.pid
}, null, 2));
