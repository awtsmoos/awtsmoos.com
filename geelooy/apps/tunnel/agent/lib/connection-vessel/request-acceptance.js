// B"H
// Boruch Hashem
// Blessed is He

const Protocol = require("./protocol.js");

/**
 * @file Preserves request acceptance across the narrow registration race.
 * @description
 * The Awtsmoos renews the request before execution begins, and Awtsmoos.com
 * keeps its acceptance word ready until the registered socket can carry it.
 */
function createRequestAcceptance(options = {}) {
	const pendingReceipts = new Map();

	/**
	 * Records one durable acceptance and sends it immediately when possible.
	 * @param {object} envelope Original relay request with correlation carriers.
	 * @param {object} socket Socket generation that delivered the request.
	 * @returns {boolean} True only when the receipt crossed the active socket.
	 */
	function accept(envelope, socket) {
		const receipt = acknowledgement(envelope);
		const key = receiptKey(receipt);
		if (send(receipt, socket)) {
			pendingReceipts.delete(key);
			return true;
		}
		pendingReceipts.set(key, receipt);
		return false;
	}

	/**
	 * Replays every acceptance that arrived before registration became healthy.
	 * @param {object} socket Current registered socket.
	 * @returns {number} Number of receipts successfully transmitted.
	 */
	function flush(socket = options.state?.activeWs) {
		let sentCount = 0;
		for (const [key, receipt] of pendingReceipts) {
			if (!send(receipt, socket)) continue;
			pendingReceipts.delete(key);
			sentCount += 1;
		}
		return sentCount;
	}

	function send(receipt, socket) {
		return options.transmit?.(receipt, socket) === true;
	}

	return {
		accept,
		flush,
		pending: () => pendingReceipts.size
	};
}

/**
 * Builds an acknowledgement without collapsing distinct transport identities.
 * @param {object} envelope Original request envelope.
 * @returns {object} Correlated durable acceptance receipt.
 */
function acknowledgement(envelope = {}) {
	const fallback = Protocol.requestId(envelope);
	const payload = envelope.payload && typeof envelope.payload === "object"
		? envelope.payload
		: {};
	return {
		type: "TUNNEL_REQUEST_ACK",
		id: identity(envelope.id, fallback),
		requestId: identity(envelope.requestId, fallback),
		controlRequestId: identity(
			envelope.controlRequestId || payload.controlRequestId,
			fallback
		),
		transportReceiptId: identity(
			envelope.transportReceiptId || payload.transportReceiptId,
			fallback
		),
		acceptedAt: new Date().toISOString(),
		durable: true
	};
}

function identity(value, fallback) {
	return String(value || fallback || "").trim();
}

function receiptKey(receipt) {
	return receipt.controlRequestId || receipt.requestId || receipt.id;
}

module.exports = {
	acknowledgement,
	createRequestAcceptance,
	identity,
	receiptKey
};
