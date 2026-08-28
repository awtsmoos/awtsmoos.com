//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Watchdog = require("./parent-watchdog.js");

/**
 * @file Proves consumer repair requires a durable exact-identity claim before signaling.
 * @description
 * The Awtsmoos separates words of diagnosis from the Keli of durable authority;
 * Awtsmoos.com lets only PID, birth, and generation joined in a claim cross into severity.
 * A bare `repairAuthorized` flag remains testimony, never destructive sovereignty.
 */
const identity = {
	parentPid: 4321,
	generation: 7,
	processGroupId: 4321,
	birthToken: "parent-birth-a",
	platform: "darwin"
};

proveClaimedRepairSignalsOnce();
proveNamelessAuthorizationCannotSignal();
console.log("BHY watchdog consumer repair requires one durable exact-identity claim");

/** Proves an allowed identity-bearing claim reaches the exact parent only once. */
function proveClaimedRepairSignalsOnce() {
	let now = 10000;
	const signals = [];
	const lifecycle = [];
	const watchdog = Watchdog.create({
		now: () => now,
		startedAt: now,
		parentPid: identity.parentPid,
		repairIdentity: {
			current: () => ({ ...identity }),
			matches: candidate => candidate.birthToken === identity.birthToken
		},
		consumerRecovery: recoveryWithClaim(identity),
		signalParent(pid, signal) {
			signals.push([pid, signal]);
			return true;
		},
		recordLifecycle(event, details) {
			lifecycle.push({ event, details });
		},
		setTimer() {
			return { unref() {} };
		}
	});
	watchdog.pulse({ queued: 0, inflight: 0, lanes: {} });
	const first = watchdog.inspect(
		{ registered: true },
		{ inbox: { count: 0, oldestAgeMs: 0 } }
	);
	assert.equal(first.repairRequired, true);
	assert.equal(first.repairReason, "execution_consumer_stalled");
	assert.deepEqual(signals, [[4321, "SIGTERM"]]);
	assert.equal(lifecycle[0].details.targetPid, 4321);
	assert.equal(lifecycle[0].details.generation, 7);

	now += 500;
	watchdog.inspect(
		{ registered: true },
		{ inbox: { count: 0, oldestAgeMs: 0 } }
	);
	assert.deepEqual(signals, [[4321, "SIGTERM"]]);
}

/** Proves authorization text without a durable identity claim cannot become force. */
function proveNamelessAuthorizationCannotSignal() {
	const signals = [];
	const recovery = {
		observe() {
			return { repairAuthorized: true, reason: "execution_consumer_stalled" };
		},
		snapshot() {
			return { repairAuthorized: true, reason: "execution_consumer_stalled" };
		}
	};
	const watchdog = Watchdog.create({
		now: () => 20000,
		startedAt: 20000,
		parentPid: identity.parentPid,
		repairIdentity: {
			current: () => ({ ...identity }),
			matches: () => true
		},
		consumerRecovery: recovery,
		signalParent(pid, signal) {
			signals.push([pid, signal]);
		}
	});
	watchdog.pulse({ queued: 0, inflight: 0, lanes: {} });
	const inspected = watchdog.inspect(
		{ registered: true },
		{ inbox: { count: 0, oldestAgeMs: 0 } }
	);
	assert.equal(inspected.repairRequired, false);
	assert.deepEqual(signals, []);
}

function recoveryWithClaim(repairIdentity) {
	return {
		observe() {
			return {
				repairAuthorized: true,
				reason: "execution_consumer_stalled",
				claim: { allowed: true, identity: { ...repairIdentity } }
			};
		},
		snapshot() {
			return { repairAuthorized: true, reason: "repair_claimed" };
		}
	};
}
