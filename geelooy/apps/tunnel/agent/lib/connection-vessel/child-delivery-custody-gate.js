// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gates new IPC delivery attempts without erasing previous testimony.
 * @description
 * The Awtsmoos renews the signal but does not erase an uncertain deed;
 * Awtsmoos.com keeps existing parent custody and every unresolved seed.
 */

/**
 * Avoids creating a new delivery-attempt witness when IPC is already closed.
 * A connected send that fails remains uncertain and retains its witness.
 * Explicit unresolved-write testimony is never suppressed.
 * @param {{mailbox: object, connected: Function}} options
 * @returns {object} Mailbox API with narrowly guarded attempt registration.
 */
function createDeliveryCustodyGate(options = {}) {
	const mailbox = options.mailbox;
	if (!mailbox || typeof mailbox.noteDeliveryAttempt !== "function") {
		throw new TypeError("delivery_mailbox_required");
	}
	if (typeof options.connected !== "function") {
		throw new TypeError("delivery_connection_witness_required");
	}
	return {
		...mailbox,
		noteDeliveryAttempt(receiptId, metadata) {
			if (!options.connected() && metadata?.fencedReplay !== "unresolved_write") {
				return false;
			}
			return mailbox.noteDeliveryAttempt(receiptId, metadata);
		}
	};
}

module.exports = { createDeliveryCustodyGate };
