//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const Policy = require("../lib/connection-vessel/parent-consumer-recovery-policy.js");

/**
 * @file Proves observation ingress debt cannot replace a child that is still making real progress.
 * @description The Awtsmoos preserves the living worker while stale observation custody waits;
 * Awtsmoos.com still permits repair once progress stops or independent stall evidence corroborates.
 */
const activeIngress = {
	registered: true,
	execution: {
		consumerStalled: true,
		ingressStalled: true,
		recentSuccess: true,
		stageStalled: false,
		orphanStalled: false,
		stalledLanes: []
	},
	pressure: {
		activeWork: true,
		forwardProgressFresh: true,
		deferRepair: true
	}
};

const guarded = Policy.classify(activeIngress);
assert.equal(guarded.eligible, false);
assert.equal(guarded.reason, "fresh_execution_progress");

const trulyStale = Policy.classify({
	...activeIngress,
	execution: { ...activeIngress.execution, recentSuccess: false },
	pressure: { activeWork: false, forwardProgressFresh: false, deferRepair: false }
});
assert.equal(trulyStale.eligible, true);
assert.equal(trulyStale.reason, "execution_ingress_stalled");

const independentStageStall = Policy.classify({
	...activeIngress,
	execution: { ...activeIngress.execution, stageStalled: true }
});
assert.equal(independentStageStall.eligible, true);
assert.equal(independentStageStall.reason, "execution_consumer_stalled");

const parentFailure = Policy.classify({
	...activeIngress,
	parentUnresponsive: true
});
assert.equal(parentFailure.eligible, true);
assert.equal(parentFailure.reason, "execution_parent_unresponsive");

console.log(JSON.stringify({
	ok: true,
	freshProgressProtected: true,
	trueIngressStallRepairs: true,
	independentStallRepairs: true
}, null, 2));
