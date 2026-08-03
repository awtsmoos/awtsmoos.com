// B"H
// Boruch Hashem
// Blessed is He

const Acceptance = require("./request-acceptance.js");

/**
 * @file Keeps accepted work visibly alive until the parent consumer responds.
 * @description
 * The Awtsmoos carries admission into motion before the worker awakens;
 * Awtsmoos.com receives a living progress word while IPC readiness is shaken.
 */
function createRequestProgress(options = {}) {
	const pendingReceipts = new Map();

	function announce(envelope, socket, acceptanceSent) {
		const receipt = progressReceipt(envelope, options.keepAliveMs);
		const key = Acceptance.receiptKey(receipt);
		if (acceptanceSent && send(receipt, socket)) {
			pendingReceipts.delete(key);
			return true;
		}
		pendingReceipts.set(key, receipt);
		return false;
	}

	function flush(socket = options.state?.activeWs, acceptanceComplete = true) {
		if (!acceptanceComplete) return 0;
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
		announce,
		flush,
		pending: () => pendingReceipts.size
	};
}

/**
 * Builds the first progress frame without pretending execution has begun.
 * @param {object} envelope Original relay request.
 * @param {number} keepAliveMs Advertised continuation interval.
 * @returns {object} Correlated durable-progress testimony.
 */
function progressReceipt(envelope = {}, keepAliveMs = 25000) {
	const payload = envelope.payload && typeof envelope.payload === "object"
		? envelope.payload
		: {};
	const fallback = require("./protocol.js").requestId(envelope);
	return {
		type: "TUNNEL_PROGRESS",
		id: Acceptance.identity(envelope.id, fallback),
		requestId: Acceptance.identity(envelope.requestId, fallback),
		controlRequestId: Acceptance.identity(
			envelope.controlRequestId || payload.controlRequestId,
			fallback
		),
		transportReceiptId: Acceptance.identity(
			envelope.transportReceiptId || payload.transportReceiptId,
			fallback
		),
		action: String(payload.action || envelope.action || "unknown"),
		ok: true,
		phase: "accepted_waiting_for_consumer",
		queued: true,
		stillRunning: true,
		longLivedConnection: true,
		keepAliveMs: boundedKeepAlive(keepAliveMs),
		durable: true,
		message: 'B"H: request is durably accepted and awaiting consumer progress.'
	};
}

function boundedKeepAlive(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : 25000;
}

module.exports = {
	createRequestProgress,
	progressReceipt
};
