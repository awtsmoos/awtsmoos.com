// B"H
// Boruch Hashem
// Blessed is He

const Protocol = require("./protocol.js");

/**
 * @file Converts queue admission testimony into one exact parent-to-child custody message.
 * @description
 * The Awtsmoos gives acceptance and rejection different names; Awtsmoos.com therefore
 * ACKs admitted work and permits destructive rejection settlement only under a complete fence.
 */
function settle(options, admission, identity, receiptId) {
	if (admission?.accepted === false) {
		return reject(options, admission, identity, receiptId);
	}
	return accept(options, identity, receiptId);
}

function accept(options, identity, receiptId) {
	const notified = options.notify(Protocol.message(Protocol.TYPES.ACK, {
		...identity,
		id: receiptId,
		transportReceiptId: identity.transportReceiptId || receiptId
	}));
	options.proxy?.progressCustody?.(
		receiptId,
		identity.childIncarnationId,
		{ phase: "queued" }
	);
	return notified !== false;
}

function reject(options, admission, identity, receiptId) {
	if (!completeFence(identity)) {
		options.log?.("error", "rejected connection request lacks exact custody fence");
		return false;
	}
	const notified = options.notify(Protocol.message(Protocol.TYPES.REJECT, {
		...identity,
		id: receiptId,
		reason: String(admission.reason || "not_admitted"),
		transportReceiptId: identity.transportReceiptId || receiptId
	}));
	return notified !== false;
}

function completeFence(identity = {}) {
	return Boolean(
		String(identity.childIncarnationId || "").trim() &&
		Number(identity.generation || 0) > 0
	);
}

module.exports = { settle };
