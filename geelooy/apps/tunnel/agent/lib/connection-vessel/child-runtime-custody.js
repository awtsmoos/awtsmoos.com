// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");
const CustodyMetadata = require("./mailbox-custody-metadata.js");
const Reconnect = require("../runtime/main-reconnect-policy.js");
/**
 * @file Transfers only an exact-incarnation parent ACK into living custody witnesses.
 * @description
 * The Awtsmoos lets one accepted deed remain one deed while process borders change.
 * Awtsmoos.com rejects delayed ACKs from older children before they can refresh custody
 * or reset reconnect pressure, so a recycled generation number cannot impersonate healing.
 */
function createCustody(options = {}) {
	/** Records parent acceptance only when the ACK belongs to this exact child incarnation. */
	function noteParentCustody(receiptId, acknowledgement = {}) {
		const expectedIncarnation = Incarnation.clean(options.state.childIncarnationId);
		if (!Incarnation.matches(
			expectedIncarnation,
			acknowledgement.childIncarnationId
		)) return false;
		const metadata = CustodyMetadata.fromAcknowledgement(
			acknowledgement,
			options.state.generation,
			expectedIncarnation
		);
		options.mailbox.noteParentCustody(receiptId, metadata);
		Reconnect.markAccepted(options.state);
		return options.parent.noteCustody(receiptId);
	}

	return { noteParentCustody };
}

module.exports = { createCustody };
