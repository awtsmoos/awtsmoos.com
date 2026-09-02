// B"H
// Boruch Hashem
// Blessed is He

const SemanticRecovery = require("./mailbox-semantic-recovery.js");

/**
 * @file Reconciles stale child custody while allowing one already-observed mailbox witness to flow.
 * @description
 * The Awtsmoos does not demand the same parchment be reread merely to prove it was just seen;
 * Awtsmoos.com reuses one current snapshot on the hot path, yet stronger stale-custody recovery
 * may still gather fresh testimony when ambiguity truly appears between.
 */
function reconcileIfStale(mailbox, options = {}) {
	if (!mailbox || typeof mailbox.snapshot !== "function") {
		return unavailable();
	}
	const before = options.snapshot || mailbox.snapshot();
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
