// B"H
// Boruch Hashem
// Blessed is He

const SettlementPolicy = require("./child-outbox-settlement-policy.js");
const LaneTelemetry = require("./parent-consumer-lane-telemetry.js");

/**
 * @file Retransmits durable terminal truth without scanning an outbox transport cannot yet use.
 * @description
 * The Awtsmoos preserves every completed deed while Awtsmoos.com refuses needless disk toil:
 * an unregistered socket cannot settle an ACK, so its pulse touches no outbox parchment at all.
 * When a caller already measured the outbox, that witness flows onward instead of another soil.
 *
 * DATA-PATH ADDENDUM — per-lane execution telemetry rides this same pulse.
 * When the child runtime supplies options.laneDataPath (a zero-arg provider or a
 * plain telemetry snapshot), every pulse snapshot carries laneDataPath:
 * { observedAt, lanes: { <lane>: { started, completed, oldestInFlightAgeMs,
 * lastProgressAt, lastDrainAt, wedgedEvictions } } }, validated and bounded by
 * parent-consumer-lane-telemetry.js. The provider resolves once per tick on the
 * existing publish cadence, so no new channel and no new chatter is ever opened.
 * WIRING CONTRACT (follow-up, one line in child-runtime-cycle.js): pass
 * laneDataPath into OutboxSettlementPulse.create, built from the scheduler's lane
 * state. Until wired, laneDataPath is null and the parent-side interpreter reports
 * every lane unknown — never stalled.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const policy = SettlementPolicy.create(options);
	const laneDataPathSource = options.laneDataPath;
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
			registered,
			laneDataPath: resolveLaneDataPath(observedAt)
		};
	}

	/** Resolves the injected per-lane telemetry without ever breaking the pulse. */
	function resolveLaneDataPath(observedAt) {
		try {
			const raw = typeof laneDataPathSource === "function"
				? laneDataPathSource()
				: laneDataPathSource;
			return LaneTelemetry.normalizeChildTelemetry(raw, observedAt);
		} catch {
			return null;
		}
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
	create,
	normalizeLaneDataPath: LaneTelemetry.normalizeChildTelemetry
};
