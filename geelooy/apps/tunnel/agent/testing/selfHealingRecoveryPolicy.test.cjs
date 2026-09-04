// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const RecoveryPolicy = require("../lib/connection-vessel/parent-consumer-recovery-policy.js");
const WatchdogPolicy = require("../lib/connection-vessel/parent-watchdog-policy.js");
const Decision = require("../lib/connection-vessel/parent-watchdog-consumer-decision.js");

/**
 * @file Proves exact stalled custody survives unrelated success and post-claim pressure.
 * @description
 * The Awtsmoos grants repair only after exact testimony; Awtsmoos.com then refuses to
 * consume that durable claim without performing the bounded healing it authorizes.
 */
test("global success cannot mask corroborated exact stall", () => {
	const result = RecoveryPolicy.classify({
		registered: true,
		execution: {
			consumerStalled: true,
			ingressStalled: true,
			recentSuccess: true
		}
	});
	assert.equal(result.eligible, true);
	assert.equal(result.reason, "execution_ingress_stalled");
});

test("fresh success still vetoes when the exact stall is gone", () => {
	const result = RecoveryPolicy.classify({
		registered: true,
		execution: { consumerStalled: false, recentSuccess: true }
	});
	assert.equal(result.eligible, false);
	assert.equal(result.reason, "fresh_execution_progress");
});

test("pressure cannot swallow a claimed exact self-heal", () => {
	for (const reason of WatchdogPolicy.NON_DEFERRABLE_REPAIRS) {
		assert.equal(
			WatchdogPolicy.shouldDeferRepair(
				{ repairRequired: true, repairReason: reason },
				{ deferRepair: true }
			),
			false,
			reason
		);
	}
	assert.equal(
		WatchdogPolicy.shouldDeferRepair(
			{ repairRequired: true, repairReason: "future_generic_repair" },
			{ deferRepair: true }
		),
		true
	);
});

test("consumer decision keeps durable claim executable under pressure", () => {
	const recovery = {
		observe: () => ({
			repairAuthorized: true,
			reason: "execution_consumer_stalled",
			claim: { allowed: true, identity: { parentPid: 4321, generation: 7 } }
		}),
		snapshot: () => ({ ledger: { history: [] } })
	};
	const result = Decision.decide({
		consumerRecovery: recovery,
		execution: { consumerStalled: true },
		inspection: {},
		pressure: { deferRepair: true },
		registered: true,
		repairIdentity: { parentPid: 4321, generation: 7 }
	});
	assert.equal(result.repairRequired, true);
	assert.equal(result.repairDeferred, false);
	assert.equal(result.repairReason, "execution_consumer_stalled");
});
