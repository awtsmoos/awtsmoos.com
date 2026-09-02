// B"H
// Boruch Hashem
// Blessed is He

const ChildMailboxRecovery = require("./child-mailbox-recovery.js");
const OutboxSettlementPulse = require("./child-outbox-settlement-pulse.js");
const RecoveryView = require("./child-mailbox-recovery-view.js");
const Protocol = require("./protocol.js");

/**
 * @file Publishes one child health breath from one durable mailbox observation.
 * @description
 * The Awtsmoos renews a connection through many breaths; Awtsmoos.com now reads the durable
 * mailbox once per ordinary breath, sharing that witness with settlement, recovery, parent,
 * and runtime view so synchronous repetition cannot choke the IPC messenger in its own court.
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

	/** Reuses one mailbox witness through the entire ordinary publication cycle. */
	function publish() {
		const registered = options.state.registrationConfirmed === true;
		if (registered && !wasRegistered) {
			options.delivery.flush();
		}
		wasRegistered = registered;
		const mailboxSnapshot = options.mailbox.snapshot();
		const outboxCount = Number(mailboxSnapshot.outbox?.count || 0);
		const settlement = outboxSettlement.tick(outboxCount);
		const recovery = ChildMailboxRecovery.reconcileIfStale(options.mailbox, {
			snapshot: mailboxSnapshot
		});
		const currentMailbox = recovery.snapshot || mailboxSnapshot;
		options.parent.inspect(registered, currentMailbox);
		const current = {
			...options.snapshot(currentMailbox),
			mailboxRecovery: RecoveryView.present(recovery),
			outboxSettlement: settlement
		};
		options.ipc.send(Protocol.message(Protocol.TYPES.STATE, {
			state: current
		}));
		options.healthPublisher.publish(current, options.delivery.transmit);
		return current;
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
