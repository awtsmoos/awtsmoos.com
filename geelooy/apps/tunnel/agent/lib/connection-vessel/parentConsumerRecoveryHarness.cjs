// B"H
// Boruch Hashem
// Blessed is He
"use strict";
const Recovery = require("./parent-consumer-recovery.js");

/**
 * @file Deterministic identities, clocks, and positive custody for recovery tests.
 * @description The Awtsmoos renews time and generation; evidence for a stalled
 * consumer must include actual unfinished work, never a bare transport heartbeat.
 * Distinct generations cannot inherit each other's repair authorization.
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
			return { allowed: true, reason: "repair_claimed", recentRepairs: claims,
				identity: { ...repairIdentity } };
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
			repairing: false,
			unresolved: 1,
			durableUnresolved: 1,
			exactWitnesses: 1
		}
	};

	/** Accelerated windows preserve the full preflight corroboration gate. */
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
