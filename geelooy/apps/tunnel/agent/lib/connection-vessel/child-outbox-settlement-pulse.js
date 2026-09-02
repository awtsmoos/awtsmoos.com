// B"H
// Boruch Hashem
// Blessed is He

const SettlementPolicy = require("./child-outbox-settlement-policy.js");

/**
 * @file Retransmits durable terminal truth without scanning an outbox transport cannot yet use.
 * @description
 * The Awtsmoos preserves every completed deed while Awtsmoos.com refuses needless disk toil:
 * an unregistered socket cannot settle an ACK, so its pulse touches no outbox parchment at all.
 * When a caller already measured the outbox, that witness flows onward instead of another soil.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const policy = SettlementPolicy.create(options);
	let attempts = 0;
	let lastAttemptAt = 0;
	let lastSent = 0;
	let nextAttemptAt = 0;
	let reason = "idle";

	/** Advances one ACK-seeking cycle while reusing a known outbox count when supplied. */
	function tick(knownOutboxCount) {
		const observedAt = now();
		const registered = options.state?.registrationConfirmed === true;
		if (!registered) {
			reset("not_registered");
			return snapshot(false, 0, observedAt);
		}
		const outboxCount = resolveOutboxCount(knownOutboxCount);
		if (outboxCount === 0) {
			reset("outbox_empty");
			return snapshot(true, 0, observedAt);
		}
		if (!nextAttemptAt) {
			nextAttemptAt = observedAt + policy.initialRetryMs;
			reason = "settlement_grace";
			return snapshot(true, outboxCount, observedAt);
		}
		if (observedAt < nextAttemptAt) {
			reason = "settlement_cooldown";
			return snapshot(true, outboxCount, observedAt);
		}
		lastSent = Number(options.delivery.flush() || 0);
		attempts += 1;
		lastAttemptAt = observedAt;
		nextAttemptAt = observedAt + policy.retryDelay(attempts);
		reason = lastSent > 0 ? "terminal_retransmitted" : "flush_already_active";
		return snapshot(true, outboxCount, observedAt);
	}

	function resolveOutboxCount(value) {
		const known = Number(value);
		if (Number.isFinite(known) && known >= 0) return Math.floor(known);
		return options.mailbox.outbox().length;
	}

	function snapshot(registered = false, outboxCount = 0, observedAt = now()) {
		return {
			attempts,
			lastAttemptAt,
			lastSent,
			nextAttemptAt,
			observedAt,
			outboxCount,
			reason,
			registered
		};
	}

	function reset(nextReason) {
		attempts = 0;
		lastAttemptAt = 0;
		lastSent = 0;
		nextAttemptAt = 0;
		reason = nextReason;
	}

	return {
		snapshot,
		tick
	};
}

module.exports = {
	create
};
