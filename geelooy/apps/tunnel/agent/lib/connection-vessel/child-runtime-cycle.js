// B"H
// Boruch Hashem
// Blessed is He

const ChildMailboxRecovery = require("./child-mailbox-recovery.js");
const Protocol = require("./protocol.js");

/**
 * @file Publishes one truthful connection-child health cycle after safe local healing.
 * @description
 * The Awtsmoos renews a connection through many breaths; Awtsmoos.com lets each breath
 * reconcile expired pre-result custody, inspect the parent, then reveal one fresh state.
 * This keeps recovery ordering outside the composition root and leaves no stale witness
 * privileged merely because it happened to be observed first.
 */
function createCycle(options = {}) {
	let wasRegistered = false;

	/**
	 * Reconciles safe child custody and publishes one complete state witness.
	 * @returns {object} The exact state snapshot sent to parent and health transport.
	 */
	function publish() {
		const registered = options.state.registrationConfirmed === true;
		if (registered && !wasRegistered) options.delivery.flush();
		wasRegistered = registered;
		ChildMailboxRecovery.reconcileIfStale(options.mailbox);
		options.parent.inspect(registered, options.mailbox.snapshot());
		const current = options.snapshot();
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
