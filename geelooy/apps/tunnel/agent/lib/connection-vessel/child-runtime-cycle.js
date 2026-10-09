// B"H
// Boruch Hashem
// Blessed is He

const { performance } = require("node:perf_hooks");
const ChildMailboxRecovery = require("./child-mailbox-recovery.js");
const OutboxSettlementPulse = require("./child-outbox-settlement-pulse.js");
const RecoveryView = require("./child-mailbox-recovery-view.js");
const Protocol = require("./protocol.js");
const HealthPublisher = require("./child-health-publisher.js");

/**
 * @file Publishes one child health breath from one durable mailbox observation.
 * @description
 * The Awtsmoos renews a connection through many breaths; Awtsmoos.com now reads the durable
 * mailbox once per ordinary breath, sharing that witness with settlement, recovery, parent,
 * and runtime view so synchronous repetition cannot choke the IPC messenger in its own court.
 */
function createCycle(options = {}) {
	let wasRegistered = false;
	let lastSlowCycleAt = 0;
	const slowCycleThresholdMs = 250;
	const outboxSettlement = options.outboxSettlement || OutboxSettlementPulse.create({
		delivery: options.delivery,
		initialRetryMs: options.outboxInitialRetryMs,
		mailbox: options.mailbox,
		maxRetryMs: options.outboxMaxRetryMs,
		now: options.now,
		state: options.state
	});

	/** Reuses one mailbox witness through the entire ordinary publication cycle. */
	function publish() {
		const registered = options.state.registrationConfirmed === true;
		if (registered && !wasRegistered) {
			options.delivery.flush();
		}
		wasRegistered = registered;
		const cycleStartedAt = performance.now();
		let stage = "mailbox_snapshot";
		try {
		const mailboxSnapshot = options.mailbox.snapshot();
		const mailboxObservedAt = performance.now();
		const outboxCount = Number(mailboxSnapshot.outbox?.count || 0);
		stage = "outbox_settlement";
		const settlement = outboxSettlement.tick(outboxCount);
		stage = "mailbox_recovery";
		const recovery = ChildMailboxRecovery.reconcileIfStale(options.mailbox, {
			snapshot: mailboxSnapshot
		});
		const currentMailbox = recovery.snapshot || mailboxSnapshot;
		stage = "parent_inspection";
		options.parent.inspect(registered, currentMailbox);
		stage = "health_snapshot";
		const current = {
			...options.snapshot(currentMailbox),
			mailboxRecovery: RecoveryView.present(recovery),
			outboxSettlement: settlement,
			// B10b: transport-liveness testimony for the TUNNEL_HEALTH digest;
			// null when no socket exists yet (digest omits the section cleanly).
			transportLiveness: HealthPublisher.transportLivenessView(options.state)
		};
		stage = "ipc_publish";
		options.ipc.send(Protocol.message(Protocol.TYPES.STATE, {
			state: current
		}));
		stage = "health_publish";
		options.healthPublisher.publish(current, options.delivery.transmit);
		const elapsedMs = performance.now() - cycleStartedAt;
		if (elapsedMs >= slowCycleThresholdMs && Date.now() - lastSlowCycleAt > 5000) {
			lastSlowCycleAt = Date.now();
			console.warn(`[tunnel-child-cycle-slow] totalMs=${Math.round(elapsedMs)} mailboxMs=${Math.round(mailboxObservedAt - cycleStartedAt)} stage=complete`);
		}
		return current;
		} catch (error) {
			console.error(`[tunnel-child-cycle-error] stage=${stage} reason=${String(error?.code || error?.message || error).slice(0, 120)}`);
			throw error;
		}
	}

	function status() {
		return {
			outboxSettlement: outboxSettlement.snapshot(),
			wasRegistered
		};
	}

	return {
		publish,
		status
	};
}

module.exports = {
	createCycle
};
