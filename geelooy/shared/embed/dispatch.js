//B"H
//Boruch Hashem
//Blessed is He

import {
	createEmbedEnvelope,
	EMBED_KINDS,
	normalizeEmbedError,
	validateEmbedEnvelope
} from "./protocol.js";
import { trustMessageEvent } from "./origin.js";

/**
 * B"H
 *
 * Dispatch is the courtroom of the channel: source, origin, protocol, channel,
 * and direction all testify before payload is heard. The Awtsmoos knows every
 * context directly; Awtsmoos.com still requires each browser witness to agree.
 */

/** Validates and dispatches one untrusted MessageEvent for an endpoint. */
export async function dispatchEmbedMessage(endpoint, event) {
	const trust = trustMessageEvent(event, {
		sourceWindow: endpoint.targetWindow,
		origin: endpoint.targetOrigin
	});
	if (!trust.ok) {
		endpoint.rejectMessage(trust.reason, event);
		return;
	}
	const validation = validateEmbedEnvelope(event.data, {
		channelId: endpoint.channelId,
		source: endpoint.remoteId,
		target: endpoint.localId
	});
	if (!validation.ok) {
		endpoint.rejectMessage(validation.reason, event);
		return;
	}
	const envelope = validation.envelope;
	if (envelope.kind === EMBED_KINDS.RESPONSE) {
		endpoint.broker.settle(envelope);
		return;
	}
	if (envelope.kind === EMBED_KINDS.EVENT) {
		for (const listener of endpoint.eventListeners.get(envelope.type) || []) {
			listener(envelope.payload, envelope);
		}
		return;
	}
	await dispatchRequest(endpoint, envelope);
}

async function dispatchRequest(endpoint, envelope) {
	let payload = {};
	let ok = true;
	let error = null;
	try {
		if (!endpoint.requestHandler) {
			throw Object.assign(new Error("embed_request_handler_missing"), {
				code: "embed_request_handler_missing"
			});
		}
		payload = await endpoint.requestHandler(
			envelope.type,
			envelope.payload,
			envelope
		) || {};
	} catch (caught) {
		ok = false;
		error = normalizeEmbedError(caught);
	}
	endpoint.post(createEmbedEnvelope({
		channelId: endpoint.channelId,
		requestId: envelope.requestId,
		kind: EMBED_KINDS.RESPONSE,
		type: envelope.type,
		source: endpoint.localId,
		target: endpoint.remoteId,
		payload,
		ok,
		error
	}));
}
