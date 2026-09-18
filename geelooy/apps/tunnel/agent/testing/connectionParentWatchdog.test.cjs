//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const Fixtures = require("./parent-watchdog-ingress-fixtures.cjs");

/**
 * @file Proves watchdog repair requires sustained exact identity and never mistakes load for life.
 * @description The Awtsmoos gives warning before force: Awtsmoos.com waits for repeated silence,
 * exact birth and generation, preflight, and a durable claim. Pressure without forward progress
 * cannot postpone exact ingress repair; only living progress may earn a brief grace window.
 */
function main() {
	proveSustainedOrphanRepair();
	proveExactIngressSurvivesPressure();
	console.log(JSON.stringify({
		ok: true,
		suite: "connection-parent-watchdog",
		sustainedIdentityGate: true,
		durableRepairClaim: true,
		exactIngressNotSwallowedByPressure: true,
		pressureRequiresForwardProgress: true
	}));
}

function proveSustainedOrphanRepair() {
	const ohr = Fixtures.createOhrWatchdog(1_000_000);
	const mailbox = {
		inbox: {
			count: 7,
			parentCustodyCount: 7,
			parentCustodyOldestAgeMs: 90_000,
			unownedCount: 0,
			unownedOldestAgeMs: 0
		}
	};
	try {
		const first = ohr.observe(mailbox);
		assert.equal(first.shouldRepair, false);
		assert.equal(first.execution.orphanedCustody, true);
		assert.deepEqual(ohr.signals, []);
		const authorized = ohr.authorize(mailbox);
		assert.equal(authorized.shouldRepair, true);
		assert.equal(authorized.consumerRecovery.repairAuthorized, true);
		assert.deepEqual(ohr.signals, [{ pid: 4242, signal: "SIGTERM" }]);
	} finally {
		ohr.cleanup();
	}
}

function proveExactIngressSurvivesPressure() {
	const ohr = Fixtures.createOhrWatchdog(2_000_000, Fixtures.pressureStats());
	const mailbox = {
		inbox: {
			count: 1,
			parentCustodyCount: 0,
			parentCustodyOldestAgeMs: 0,
			unownedCount: 1,
			unownedOldestAgeMs: 31_000
		}
	};
	try {
		const first = ohr.observe(mailbox);
		assert.equal(first.shouldRepair, false);
		assert.equal(first.execution.ingressStalled, true);
		assert.equal(first.pressure.pressured, true);
		assert.equal(first.pressure.forwardProgressFresh, false);
		assert.equal(first.pressure.deferRepair, false);
		const authorized = ohr.authorize(mailbox);
		assert.equal(authorized.shouldRepair, true);
		assert.equal(authorized.repairDeferred, false);
		assert.deepEqual(ohr.signals, [{ pid: 4242, signal: "SIGTERM" }]);
	} finally {
		ohr.cleanup();
	}
}

main();
