// B"H
// Boruch Hashem
// Blessed is He

const SemanticRecovery = require("./mailbox-semantic-recovery.js");

/**
 * @file Heals the connection child's own custody before watchdog testimony is published.
 * @description
 * The Awtsmoos lets stale pre-result custody leave the hot path without erasing history.
 * Awtsmoos.com heals the exact child-owned mailbox in-process, while result testimony
 * remains untouched until acknowledgement or a stronger recovery covenant can decide it.
 */

/**
 * Reconciles the child mailbox only when its exact parent custody has crossed stale age.
 * @param {object} mailbox Live child-owned mailbox object.
 * @param {object} options Optional reason passed into the semantic recovery witness.
 * @returns {object} Bounded recovery testimony; never redispatches accepted work.
 */
function reconcileIfStale(mailbox, options = {}) {
	if (!mailbox || typeof mailbox.snapshot !== "function") {
		return unavailable();
	}
	const before = mailbox.snapshot();
	const staleCount = Number(before.inbox?.parentCustodyStaleCount || 0);
	if (staleCount < 1) {
		return {
			attempted: false,
			ok: true,
			reason: "child_mailbox_fresh",
			staleCount: 0
		};
	}
	const recovered = SemanticRecovery.reconcile(mailbox, {
		reason: String(options.reason || "child_periodic_stale_custody")
	});
	return {
		attempted: true,
		...recovered,
		staleCount
	};
}

function unavailable() {
	return {
		attempted: false,
		ok: false,
		error: "child_mailbox_unavailable"
	};
}

module.exports = {
	reconcileIfStale,
	unavailable
};
