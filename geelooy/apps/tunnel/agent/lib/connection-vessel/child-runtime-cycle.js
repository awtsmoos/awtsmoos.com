// B"H
// Boruch Hashem
// Blessed is He

const ChildMailboxRecovery = require("./child-mailbox-recovery.js");
const OutboxSettlementPulse = require("./child-outbox-settlement-pulse.js");
const RecoveryView = require("./child-mailbox-recovery-view.js");
const Protocol = require("./protocol.js");

/**
 * @file Publishes one truthful connection-child health cycle after safe local healing.
 * @description
 * The Awtsmoos renews a connection through many breaths; Awtsmoos.com lets each breath
 * reconcile child-owned custody, seek acknowledgement for durable terminal testimony,
 * and only then publish state. A lost ACK may repeat truth, never repeat the deed.
 */

/**
 * Creates the connection-child cycle that composes settlement, reconciliation, and health publication.
 * @param {object} options Runtime dependencies and optional settlement timing configuration.
 * @param {object} options.state Mutable child connection state containing `registrationConfirmed`.
 * @param {{flush:()=>number,transmit:(message:object)=>boolean}} options.delivery Durable response transport used for registration flushes, terminal replay, and health transmission.
 * @param {object} options.mailbox Durable connection mailbox supporting snapshots, inbox recovery, and outbox enumeration.
 * @param {{inspect:(registered:boolean,mailboxSnapshot:object)=>void}} options.parent Parent-liveness observer updated from current registration and mailbox testimony.
 * @param {{send:(message:object)=>void}} options.ipc Parent-process IPC adapter receiving the complete child state snapshot.
 * @param {{publish:(state:object,transmit:Function)=>void}} options.healthPublisher Health publisher that forwards compact runtime testimony through the active transport.
 * @param {()=>object} options.snapshot Function producing the connection child's base runtime snapshot before recovery fields are composed.
 * @param {()=>number} [options.now=Date.now] Clock injected into outbox settlement timing for deterministic tests.
 * @param {number} [options.outboxInitialRetryMs=2000] Grace period before the first same-generation durable terminal-response retry.
 * @param {number} [options.outboxMaxRetryMs=30000] Maximum cooldown between repeated terminal-response retries.
 * @param {{tick:()=>object,snapshot:()=>object}} [options.outboxSettlement] Optional prebuilt settlement pulse used by focused runtime-cycle tests.
 * @returns {{publish:()=>object,status:()=>object}} Cycle API for performing one health breath and inspecting local composition state.
 * @sideEffect `publish()` may retransmit persisted terminal responses, reconcile mailbox custody, inspect parent health, send IPC, and publish transport health.
 */
function createCycle(options = {}) {
	let wasRegistered = false;
	const outboxSettlement = options.outboxSettlement || OutboxSettlementPulse.create({
		delivery: options.delivery,
		initialRetryMs: options.outboxInitialRetryMs,
		mailbox: options.mailbox,
		maxRetryMs: options.outboxMaxRetryMs,
		now: options.now,
		state: options.state
	});

	/**
	 * Reconciles safe custody, retries unsettled terminal responses, and publishes state.
	 * @returns {object} Exact child snapshot with mailbox recovery and settlement testimony.
	 * @sideEffect May replay persisted outbox envelopes, reconcile mailbox state, inspect parent health, send IPC state, and publish health.
	 */
	function publish() {
		const registered = options.state.registrationConfirmed === true;
		if (registered && !wasRegistered) {
			options.delivery.flush();
		}
		wasRegistered = registered;
		const settlement = outboxSettlement.tick();
		const recovery = ChildMailboxRecovery.reconcileIfStale(options.mailbox);
		options.parent.inspect(registered, options.mailbox.snapshot());
		const current = {
			...options.snapshot(),
			mailboxRecovery: RecoveryView.present(recovery),
			outboxSettlement: settlement
		};
		options.ipc.send(Protocol.message(Protocol.TYPES.STATE, { state: current }));
		options.healthPublisher.publish(current, options.delivery.transmit);
		return current;
	}

	/**
	 * Returns composition-local cycle state without publishing, reconciling, or transmitting anything.
	 * @returns {{wasRegistered:boolean,outboxSettlement:object}} Registration-transition state plus current settlement testimony.
	 */
	function status() {
		return {
			outboxSettlement: outboxSettlement.snapshot(),
			wasRegistered
		};
	}

	return { publish, status };
}

module.exports = { createCycle };
