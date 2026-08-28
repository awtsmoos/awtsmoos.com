// B"H
// Boruch Hashem
// Blessed is He

const SettlementPolicy = require("./child-outbox-settlement-policy.js");

/**
 * @file Retransmits durable terminal testimony until the relay acknowledges settlement.
 * @description
 * The Awtsmoos gives one completed deed one immutable truth, even when a packet or ACK
 * disappears between worlds. Awtsmoos.com therefore repeats only the saved outbox
 * envelope with bounded Gevurah, never the underlying command, mutation, or mission.
 */

/**
 * Creates one in-memory settlement pulse around an existing durable outbox transport.
 * @param {object} options Runtime dependencies and retry timing configuration.
 * @param {{flush:()=>number}} options.delivery Durable-response delivery adapter whose `flush()` resends persisted outbox envelopes only.
 * @param {{outbox:()=>Array}} options.mailbox Connection mailbox exposing the current durable outbox entries awaiting server ACK.
 * @param {{registrationConfirmed:boolean}} options.state Mutable connection state whose registration flag proves the socket may carry settlement traffic.
 * @param {()=>number} [options.now=Date.now] Clock returning milliseconds for deterministic cooldown calculation and tests.
 * @param {number} [options.initialRetryMs=2000] Grace period before the first same-generation terminal-response retry.
 * @param {number} [options.maxRetryMs=30000] Maximum cooldown between later retries while the same outbox remains unsettled.
 * @returns {{tick:()=>object,snapshot:(registered?:boolean,outboxCount?:number,observedAt?:number)=>object}} Settlement controller exposing mutation and read-only testimony operations.
 * @sideEffect `tick()` may call `options.delivery.flush()`; creation itself performs no I/O, action execution, or socket transmission.
 */
function create(options = {}) {
	const now = options.now || Date.now;
	const policy = SettlementPolicy.create(options);
	let attempts = 0;
	let lastAttemptAt = 0;
	let lastSent = 0;
	let nextAttemptAt = 0;
	let reason = "idle";

	/**
	 * Advances one acknowledgement-seeking cycle without executing any original deed.
	 * @returns {object} Current registration, outbox, retry, and send-count testimony.
	 * @sideEffect May call `delivery.flush()` to retransmit already-persisted responses.
	 */
	function tick() {
		const observedAt = now();
		const registered = options.state?.registrationConfirmed === true;
		const outboxCount = options.mailbox.outbox().length;
		if (!registered || outboxCount === 0) {
			reset(registered ? "outbox_empty" : "not_registered");
			return snapshot(registered, outboxCount, observedAt);
		}
		if (!nextAttemptAt) {
			nextAttemptAt = observedAt + policy.initialRetryMs;
			reason = "settlement_grace";
			return snapshot(registered, outboxCount, observedAt);
		}
		if (observedAt < nextAttemptAt) {
			reason = "settlement_cooldown";
			return snapshot(registered, outboxCount, observedAt);
		}
		lastSent = Number(options.delivery.flush() || 0);
		attempts += 1;
		lastAttemptAt = observedAt;
		nextAttemptAt = observedAt + policy.retryDelay(attempts);
		reason = lastSent > 0 ? "terminal_retransmitted" : "flush_already_active";
		return snapshot(registered, outboxCount, observedAt);
	}

	/**
	 * Returns the current retry state without mutating mailbox or socket state.
	 * @param {boolean} [registered=false] Whether the active socket registration is confirmed.
	 * @param {number} [outboxCount=0] Number of durable terminal envelopes awaiting ACK.
	 * @param {number} [observedAt=now()] Millisecond timestamp represented by this testimony.
	 * @returns {object} Immutable settlement-pulse status for parent diagnostics and tests.
	 */
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

	/**
	 * Clears retry timing after settlement or registration loss.
	 * @param {string} nextReason Diagnostic reason explaining why retry state reset.
	 * @returns {void} Mutates only this pulse's in-memory timing testimony.
	 */
	function reset(nextReason) {
		attempts = 0;
		lastAttemptAt = 0;
		lastSent = 0;
		nextAttemptAt = 0;
		reason = nextReason;
	}

	return { snapshot, tick };
}

module.exports = { create };
