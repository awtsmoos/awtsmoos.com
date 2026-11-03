// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const assert = require("node:assert/strict");
const Policy = require("./parent-consumer-recovery-policy.js");

/**
 * @file Proves Awtsmoos.com repairs only corroborated, stuck owning work.
 * The Awtsmoos grants true stalled deeds their measured hour;
 * no candidate probe may seize destructive power.
 */
function run() {
	const registered = { registered: true };
	const stage = {
		...registered,
		execution: { stageStalled: true, consumerStalled: false, inflight: 1 }
	};
	assert.deepEqual(Policy.classify(stage), {
		eligible: true,
		reason: "execution_consumer_stalled"
	});
	const orphan = {
		...registered,
		execution: { orphanStalled: true, consumerStalled: false, orphanedCustodyCount: 1 }
	};
	assert.equal(Policy.classify(orphan).eligible, true);
	assert.equal(Policy.classify({ ...registered, execution: {
		stageStalled: true, consumerStalled: false, inflight: 0
	}}).eligible, false);
	assert.equal(Policy.classify({ ...registered, execution: {
		consumerStalled: false, ingressStalled: true, unresolved: 1
	}}).eligible, false);
	assert.equal(Policy.classify({ ...registered, execution: {
		consumerStalled: true, ingressStalled: true, unresolved: 1,
		recentSuccess: true
	}, pressure: { activeWork: true, forwardProgressFresh: true }
	}).eligible, false);
	for (const parentFailure of [
		{ parentUnresponsive: true },
		{ controlStalled: true }
	]) {
		assert.deepEqual(Policy.classify({ ...registered, ...parentFailure,
			execution: { candidateMode: "candidate-probe", inflight: 1 }
		}), { eligible: false, reason: "candidate_probe_exempt" });
	}
	assert.equal(Policy.classify({ ...stage, registered: false }).eligible, false);
	assert.equal(Policy.classify({ ...stage, execution: {
		...stage.execution, repairing: true
	}}).eligible, false);
	console.log("B\"H independent-stall recovery and probe isolation verified");
}

run();
