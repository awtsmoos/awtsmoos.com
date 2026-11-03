// B"H
// Boruch Hashem
// Blessed is He

"use strict";
const MAX_OBSERVATION_MS = 180000;

/**
 * @file Observes one durable Awtsmoos.com device action until terminal truth.
 * The Awtsmoos keeps a single deed through many views;
 * a lost HTTP response never grants another native action to choose.
 */
function pending(receipt) {
	return receipt?.pending === true ||
		receipt?.action === "tunnelRequestPending" ||
		(receipt?.status === 202 && receipt?.terminal === false);
}

/** Only a settled, successful native result proves the device operation. */
function result(envelope) {
	if (!envelope || typeof envelope !== "object" || pending(envelope)) return null;
	if (envelope.ok === false) throw Error("DEVICE_OPERATION_FAILED");
	for (const candidate of [
		envelope.result?.result, envelope.result?.data, envelope.result,
		envelope.response?.result, envelope.response?.data, envelope.response,
		envelope.body?.result, envelope.body, envelope.data?.result,
		envelope.data, envelope
	]) {
		if (candidate?.ok === true && !pending(candidate) &&
			candidate?.terminal !== false) return candidate;
	}
	throw Error("DEVICE_OPERATION_FAILED");
}

/** An initial connection drop might hide an accepted mutation; observe only. */
async function awaitNativeReceipt(send, server, owner, route, original,
	options = {}) {
	const deadline = Date.now() + (options.timeoutMs || MAX_OBSERVATION_MS);
	let response;
	try {
		response = await send(server, owner, route, original, options.timeoutMs);
	} catch {
		response = { pending: true, retryAfterMs: 100 };
	}
	let pollNumber = 0;
	while (pending(response)) {
		if (Date.now() >= deadline) throw Error("DEVICE_RECEIPT_TIMEOUT");
		const after = Math.max(100, Math.min(1000,
			Number(response.retryAfterMs) || 200 + pollNumber * 50));
		await new Promise(resolve => setTimeout(resolve, after));
		pollNumber += 1;
		const query = {
			action: "retryAction",
			requestedAction: original.action,
			controlRequestId: original.controlRequestId,
			clientRequestId: original.clientRequestId,
			nonce: original.nonce,
			agentSessionId: original.agentSessionId,
			logicalAgentId: original.logicalAgentId,
			generation: original.generation,
			httpSafeWaitMs: 500,
			relayWaitMs: 500,
			autoPreview: false
		};
		try {
			response = await send(server, owner, route, query, 10000);
		} catch {
			// Observation can be repeated; accepted native action remains unique.
			response = { pending: true, retryAfterMs: 500 };
		}
	}
	return result(response);
}

module.exports = { awaitNativeReceipt, pending, result, MAX_OBSERVATION_MS };
