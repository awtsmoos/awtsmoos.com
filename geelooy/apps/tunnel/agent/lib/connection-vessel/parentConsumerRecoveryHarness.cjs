//B"H
// Boruch Hashem
// Blessed is He

const Recovery = require("./parent-consumer-recovery.js");

/**
 * @file Provides deterministic identity, clocks, and durable claims for recovery proofs.
 * @description
 * The Awtsmoos renews time and generation; Awtsmoos.com names both in one clear Keli.
 * Tests may move the clock or identity, yet no repair may cross from yesterday into today.
 * The ledger records exactly what was claimed so corroboration can be challenged safely.
 */
function createHarness(startAt = 10000) {
	let now = startAt;
	let claims = 0;
	const identity = {
		parentPid: 4321,
		generation: 7,
		processGroupId: 4321,
		birthToken: "parent-birth-a",
		platform: "darwin"
	};
	const ledger = {
		claim(reason, repairIdentity) {
			claims += 1;
			return {
				allowed: true,
				reason: "repair_claimed",
				recentRepairs: claims,
				identity: { ...repairIdentity }
			};
		},
		status() {
			return { history: [] };
		}
	};
	const stalled = {
		registered: true,
		parentUnresponsive: false,
		controlStalled: false,
		pressure: { deferRepair: false },
		repairIdentity: { ...identity },
		execution: {
			backpressured: false,
			consumerStalled: true,
			ingressStalled: true,
			recentSuccess: false,
			repairing: false
		}
	};

	/** Creates short timing windows while retaining a distinct post-maturity preflight. */
	function fastRecovery() {
		return Recovery.create({
			ledger,
			minimumObservations: 2,
			now: clock,
			preflightOptions: { minimumObservations: 2, preflightMs: 250 },
			sustainMs: 1000
		});
	}

	function clock() {
		return now;
	}

	return {
		clock,
		fastRecovery,
		identity,
		get claims() {
			return claims;
		},
		ledger,
		setNow(value) {
			now = value;
		},
		stalled
	};
}

module.exports = { createHarness };
