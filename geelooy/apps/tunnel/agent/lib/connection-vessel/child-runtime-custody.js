// B"H
// Boruch Hashem
// Blessed is He

const CustodyMetadata = require("./mailbox-custody-metadata.js");

/**
 * @file Transfers one parent ACK into generation-aware child and parent custody witnesses.
 * @description
 * The Awtsmoos lets one accepted deed remain one deed while crossing process borders.
 * Awtsmoos.com stamps the live connection generation beside request and shliach identity,
 * then renews the parent pulse without burdening the runtime composition root.
 */
function createCustody(options = {}) {
	/**
	 * Records one accepted transport receipt in the child mailbox and parent health pulse.
	 * @param {string} receiptId Durable transport receipt accepted by the parent queue.
	 * @param {object} acknowledgement Identity-bearing parent ACK IPC message.
	 * @returns {*} Parent-side custody witness.
	 */
	function noteParentCustody(receiptId, acknowledgement = {}) {
		const metadata = CustodyMetadata.fromAcknowledgement(
			acknowledgement,
			options.state.generation
		);
		options.mailbox.noteParentCustody(receiptId, metadata);
		return options.parent.noteCustody(receiptId);
	}

	return { noteParentCustody };
}

module.exports = { createCustody };
