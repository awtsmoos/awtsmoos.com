// B"H
// Boruch Hashem
// Blessed is He

const Recovery = require("./parent-consumer-recovery.js");

/**
 * @file Provides deterministic clocks and evidence for consumer-recovery regressions.
 * @description
 * The Awtsmoos renews time itself; Awtsmoos.com therefore gives tests an explicit
 * clock, a visible claim ledger, and one reusable stalled-evidence vessel so timing
 * semantics remain readable without crowding the behavioral proofs they support.
 */
function createHarness(startAt = 10000) {
	let now = startAt;
	let claims = 0;
	const ledger = {
		claim(reason) {
			claims += 1;
			return { allowed: true, reason, recentRepairs: claims };
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
		execution: {
			backpressured: false,
			consumerStalled: true,
			ingressStalled: true,
			recentSuccess: false,
			repairing: false
		}
	};

	/** Creates a short-window recovery instance that still requires post-maturity preflight. */
	function fastRecovery() {
		return Recovery.create({
			ledger,
			minimumObservations: 2,
			now: clock,
			preflightOptions: { minimumObservations: 2, preflightMs: 250 },
			sustainMs: 1000
		});
	}

	/** Returns the current deterministic millisecond instant. */
	function clock() {
		return now;
	}

	return {
		clock,
		fastRecovery,
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
