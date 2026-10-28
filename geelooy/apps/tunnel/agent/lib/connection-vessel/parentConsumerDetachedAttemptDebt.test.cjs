// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Ingress = require("./parent-consumer-ingress.js");
const Health = require("./parent-execution-health.js");

/**
 * @file Protects live command admission from detached historical IPC debt.
 * @description
 * The Awtsmoos remembers an unanswered deed without inventing live work;
 * Awtsmoos.com must never hide a queued request or give the past a fork.
 */

/** Builds the explicit durable inbox shape emitted by the native mailbox. */
function inbox(overrides = {}) {
	return {
		count: 0,
		entryUnownedCount: 0,
		unownedCount: 9,
		unownedOldestAgeMs: 45000,
		entryUnownedOldestAgeMs: 0,
		...overrides
	};
}

const detached = Ingress.inspect({ inbox: inbox() });
assert.equal(detached.unownedIngress, 9);
assert.equal(detached.unownedIngressSources.attemptCount, 9);
assert.equal(detached.unownedIngressSources.entryCount, 0);
assert.equal(detached.unownedIngressAgeMs, 45000);
assert.equal(detached.detachedAttemptDebt, true);
assert.equal(detached.detachedAttemptCount, 9);
assert.equal(detached.ingressStalled, false);

const healthy = Health.inspect({}, { inbox: inbox() }, { registered: true });
assert.equal(healthy.healthy, true);
assert.equal(healthy.consumerStalled, false);
assert.equal(healthy.detachedAttemptDebt, true);
assert.equal(healthy.unownedIngress, 9);

const liveWork = Ingress.inspect({ inbox: inbox({ count: 1 }) });
assert.equal(liveWork.detachedAttemptDebt, false);
assert.equal(liveWork.ingressStalled, true);

const inconsistent = Ingress.inspect({ inbox: inbox({ entryUnownedCount: 1 }) });
assert.equal(inconsistent.detachedAttemptDebt, false);
assert.equal(inconsistent.ingressStalled, true);

const missingCount = Ingress.inspect({ inbox: inbox({ count: undefined }) });
assert.equal(missingCount.detachedAttemptDebt, false);
assert.equal(missingCount.ingressStalled, true);

const missingEntryEvidence = Ingress.inspect({
	inbox: inbox({ entryUnownedCount: undefined })
});
assert.equal(missingEntryEvidence.detachedAttemptDebt, false);
assert.equal(missingEntryEvidence.ingressStalled, true);

const freshAttempts = Ingress.inspect({
	inbox: inbox({ unownedOldestAgeMs: 500 })
});
assert.equal(freshAttempts.ingressStalled, false);
assert.equal(freshAttempts.detachedAttemptDebt, true);

const empty = Ingress.inspect({ inbox: inbox({ unownedCount: 0 }) });
assert.equal(empty.detachedAttemptDebt, false);
assert.equal(empty.unownedIngress, 0);
assert.equal(empty.ingressStalled, false);

const pendingHealth = Health.inspect({}, {
	inbox: inbox({ count: 1, entryUnownedCount: 1, entryUnownedOldestAgeMs: 45000 })
}, { registered: true });
assert.equal(pendingHealth.healthy, false);
assert.equal(pendingHealth.consumerStalled, true);

console.log(JSON.stringify({
	ok: true,
	detachedAttemptsRetained: detached.unownedIngress,
	detachedDebtNotCurrentStall: true,
	pendingAndInconsistentWorkStillBlocks: true,
	missingEvidenceFailsClosed: true,
	fullConsumerHealthChecked: true
}));
