// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Helpers = require("../lib/runtime/main-startup-helpers.js");

/**
 * @file Proves a readonly candidate never performs owning project-history cleanup.
 * @description
 * The Awtsmoos lets the staged messenger witness localhost without pruning another
 * vessel's garden. Awtsmoos.com preserves ordinary owning maintenance while the
 * candidate remains non-owning, non-pairing, and ready to prove life quickly.
 */
function withRegistrationMode(mode, work) {
	const original = process.env.AWTSMOOS_REGISTRATION_MODE;
	if (mode === undefined) {
		delete process.env.AWTSMOOS_REGISTRATION_MODE;
	} else {
		process.env.AWTSMOOS_REGISTRATION_MODE = mode;
	}
	try {
		return work();
	} finally {
		if (original === undefined) {
			delete process.env.AWTSMOOS_REGISTRATION_MODE;
		} else {
			process.env.AWTSMOOS_REGISTRATION_MODE = original;
		}
	}
}

const config = {
	root: "/project",
	deviceStateRoot: "/state"
};
let cleanupCalls = 0;
const dependencies = {
	HistoryCleanup: {
		cleanupAwtsmoosState(options) {
			cleanupCalls += 1;
			return {
				ok: true,
				options
			};
		}
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
assert.equal(cleanupCalls, 0);

const owner = withRegistrationMode(undefined, () => {
	return Helpers.cleanupHistory(dependencies, config);
});
assert.equal(owner.ok, true);
assert.equal(cleanupCalls, 1);
assert.deepEqual(owner.options, {
	projectRoot: "/project",
	stateRoot: "/state",
	dryRun: false
});

console.log(JSON.stringify({
	ok: true,
	suite: "candidate-startup-history-policy",
	candidateCleanupCalls: 0,
	owningCleanupCalls: cleanupCalls
}, null, 2));
