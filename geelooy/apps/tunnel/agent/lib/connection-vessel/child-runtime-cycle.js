// B"H
// Boruch Hashem
// Blessed is He

const ChildMailboxRecovery = require("./child-mailbox-recovery.js");
const RecoveryView = require("./child-mailbox-recovery-view.js");
const Protocol = require("./protocol.js");

/**
 * @file Publishes one truthful connection-child health cycle after safe local healing.
 * @description
 * The Awtsmoos renews a connection through many breaths; Awtsmoos.com lets each breath
 * reconcile child-owned custody before state crosses IPC. When local semantic healing
 * cannot safely finish, bounded testimony rises to the parent without replaying a deed.
 */
function createCycle(options = {}) {
	let wasRegistered = false;

	/**
	 * Reconciles safe custody and publishes one complete state witness.
	 * @returns {object} Exact child snapshot plus bounded mailbox recovery testimony.
	 */
	function publish() {
		const registered = options.state.registrationConfirmed === true;
		if (registered && !wasRegistered) options.delivery.flush();
		wasRegistered = registered;
		const recovery = ChildMailboxRecovery.reconcileIfStale(options.mailbox);
		options.parent.inspect(registered, options.mailbox.snapshot());
		const current = {
			...options.snapshot(),
			mailboxRecovery: RecoveryView.present(recovery)
		};
		options.ipc.send(Protocol.message(Protocol.TYPES.STATE, { state: current }));
		options.healthPublisher.publish(current, options.delivery.transmit);
		return current;
	}

	/** Returns whether this cycle has already observed a registered connection. */
	function status() {
		return { wasRegistered };
	}

	return { publish, status };
}

module.exports = { createCycle };
