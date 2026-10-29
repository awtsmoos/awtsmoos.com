// B"H
// Boruch Hashem
// Blessed is He

const SettlementPolicy = require('./child-outbox-settlement-policy.js');
const LaneTelemetry = require('./parent-consumer-lane-telemetry.js');
const Protocol = require('./protocol.js');
const MAX_RETRIES_PER_TICK = 8;

/**
 * @file Re-sends only durable terminal results, never the original command.
 * @description The Awtsmoos renews each completed testimony through silence;
 * Awtsmoos.com trusts the relay ACK, not a prior socket-send remembrance.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const policy = SettlementPolicy.create(options);
	const laneDataPathSource = options.laneDataPath;
	let attempts = 0;
	let lastAttemptAt = 0;
	let lastSent = 0;
	let nextAttemptAt = 0;
	let cursor = 0;
	let reason = 'idle';

	/** Preserves known-count fast paths until a real terminal retry is due. */
	function tick(knownOutboxCount) {
		const observedAt = now();
		if (options.state?.registrationConfirmed !== true) {
			reset('not_registered');
			return snapshot(false, 0, observedAt);
		}
		const outboxCount = resolveOutboxCount(knownOutboxCount);
		if (outboxCount === 0) {
			reset('outbox_empty');
			return snapshot(true, 0, observedAt);
		}
		if (!nextAttemptAt) {
			nextAttemptAt = observedAt + policy.initialRetryMs;
			reason = 'settlement_grace';
			return snapshot(true, outboxCount, observedAt);
		}
		if (observedAt < nextAttemptAt) {
			reason = 'settlement_cooldown';
			return snapshot(true, outboxCount, observedAt);
		}
		lastSent = retransmitExactResults();
		attempts += 1;
		lastAttemptAt = observedAt;
		nextAttemptAt = observedAt + policy.retryDelay(attempts);
		reason = lastSent > 0 ? 'terminal_retransmitted' : 'terminal_retry_unconfirmed';
		return snapshot(true, outboxCount, observedAt);
	}

	/** Bypasses socket-send dedup with an exact durable network-response ID. */
	function retransmitExactResults() {
		const entries = options.mailbox.outbox();
		if (!entries.length) return 0;
		let sent = 0;
		const batchSize = Math.min(MAX_RETRIES_PER_TICK, entries.length);
		for (let index = 0; index < batchSize; index++) {
			const position = (cursor + index) % entries.length;
			const envelope = entries[position];
			if (envelope?.type !== 'TUNNEL_RESPONSE') continue;
			const receiptId = Protocol.requestId(envelope);
			if (typeof receiptId !== 'string' || !receiptId.trim()) continue;
			try {
				if (options.delivery.flush(receiptId) > 0) sent++;
			} catch { /* Preserve the durable result for the next bounded retry. */ }
		}
		cursor = (cursor + batchSize) % entries.length;
		return sent;
	}

	function resolveOutboxCount(value) {
		const known = Number(value);
		if (Number.isFinite(known) && known >= 0) return Math.floor(known);
		return options.mailbox.outbox().length;
	}

	function snapshot(registered = false, outboxCount = 0, observedAt = now()) {
		return {
			attempts, lastAttemptAt, lastSent, nextAttemptAt, observedAt,
			outboxCount, reason, registered, laneDataPath: resolveLaneDataPath(observedAt)
		};
	}

	/** Lane telemetry cannot be allowed to interrupt result settlement. */
	function resolveLaneDataPath(observedAt) {
		try {
			const raw = typeof laneDataPathSource === 'function'
				? laneDataPathSource() : laneDataPathSource;
			return LaneTelemetry.normalizeChildTelemetry(raw, observedAt);
		} catch { return null; }
	}

	function reset(nextReason) {
		attempts = 0;
		lastAttemptAt = 0;
		lastSent = 0;
		nextAttemptAt = 0;
		cursor = 0;
		reason = nextReason;
	}

	return { snapshot, tick };
}

module.exports = {
	create,
	normalizeLaneDataPath: LaneTelemetry.normalizeChildTelemetry
};
