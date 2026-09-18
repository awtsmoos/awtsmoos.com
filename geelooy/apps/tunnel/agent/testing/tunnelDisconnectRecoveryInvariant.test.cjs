//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Health = require("../lib/connection-vessel/parent-execution-health.js");
const Policy = require("../lib/connection-vessel/parent-consumer-recovery-policy.js");
const Pressure = require("../lib/connection-vessel/parent-watchdog-pressure.js");
const WatchdogPolicy = require("../lib/connection-vessel/parent-watchdog-policy.js");

/**
 * @file Reproduces the accepted-not-consumed pressure stall that previously preceded route loss.
 * @description The Awtsmoos does not call unresolved custody "healthy work" merely because the
 * event loop is busy. Awtsmoos.com demands forward progress, gives ingress seven seconds to acquire
 * custody, and lets exact parent/control/consumer testimony reach the identity-fenced repair gate.
 */
test("soft pressure without completed progress cannot defer repair", () => {
	const pressure = Pressure.evidence({
		circuit: { level: "soft", representativeLagMs: 900 },
		eventLoopLag: { lastMs: 800, p90Ms: 900 },
		inflight: 1,
		executionStages: { active: 1 }
	}, { lastPulseAt: 9900, now: 10000 });
	assert.equal(pressure.pressured, true);
	assert.equal(pressure.activeWork, true);
	assert.equal(pressure.forwardProgressFresh, false);
	assert.equal(pressure.deferRepair, false);
});

test("accepted unowned ingress becomes stalled at seven seconds by default", () => {
	const before = Health.inspect({}, {
		inbox: { entryUnownedCount: 1, entryUnownedOldestAgeMs: 6999 }
	}, { registered: true });
	const boundary = Health.inspect({}, {
		inbox: { entryUnownedCount: 1, entryUnownedOldestAgeMs: 7000 }
	}, { registered: true });
	assert.equal(before.ingressStalled, false);
	assert.equal(boundary.ingressStalled, true);
	assert.equal(boundary.consumerStalled, true);
	assert.equal(boundary.ingressStaleMs, 7000);
});

test("parent and control failure outrank pressure and unrelated success", () => {
	const base = {
		registered: true,
		pressure: { deferRepair: true },
		execution: {
			consumerStalled: false,
			recentSuccess: true,
			repairing: false
		}
	};
	assert.deepEqual(
		Policy.classify({ ...base, parentUnresponsive: true }),
		{ eligible: true, reason: "execution_parent_unresponsive" }
	);
	assert.deepEqual(
		Policy.classify({ ...base, controlStalled: true }),
		{ eligible: true, reason: "execution_control_stalled" }
	);
});

test("all exact failure classes are non-deferrable after corroboration", () => {
	for (const reason of [
		"execution_ingress_stalled",
		"execution_consumer_stalled",
		"execution_parent_unresponsive",
		"execution_control_stalled"
	]) {
		assert.equal(WatchdogPolicy.isExactSelfHeal(reason), true);
		assert.equal(WatchdogPolicy.shouldDeferRepair({ repairRequired: true, repairReason: reason }, { deferRepair: true }), false);
	}
});
