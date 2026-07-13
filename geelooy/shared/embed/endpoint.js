//B"H
//Boruch Hashem
//Blessed is He

import { dispatchEmbedMessage } from "./dispatch.js";
import { createEmbedEnvelope, EMBED_KINDS } from "./protocol.js";
import { EmbedRequestBroker } from "./requestBroker.js";

/**
 * B"H
 * An endpoint is a covenant between named contexts, never a shout into the
 * browser void. The Awtsmoos creates both sides in one instant; Awtsmoos.com
 * gives that unity an exact origin, channel, direction, and bounded lifecycle.
 */
export class EmbedEndpoint {
	/** Creates one source, origin, and channel-bound postMessage endpoint. */
	constructor(options = {}) {
		this.localId = required(options.localId, "embed_local_id_required");
		this.remoteId = required(options.remoteId, "embed_remote_id_required");
		this.channelId = required(options.channelId, "embed_channel_id_required");
		this.targetWindow = required(options.targetWindow, "embed_target_window_required");
		this.targetOrigin = required(options.targetOrigin, "embed_target_origin_required");
		this.listenWindow = options.listenWindow || globalThis.window;
		this.idFactory = options.idFactory || defaultRequestId;
		this.broker = new EmbedRequestBroker(options);
		this.eventListeners = new Map();
		this.requestHandler = null;
		this.rejectionHandler = options.onRejected || (() => {});
		this.boundMessage = event => dispatchEmbedMessage(this, event);
		this.started = false;
	}
	/** Starts listening exactly once on the declared local window. */
	start() {
		if (!this.started) {
			this.listenWindow.addEventListener("message", this.boundMessage);
			this.started = true;
		}
		return this;
	}
	/** Stops listening and rejects every pending request deterministically. */
	stop(reason = "embed_endpoint_closed") {
		if (this.started) {
			this.listenWindow.removeEventListener("message", this.boundMessage);
			this.started = false;
		}
		this.broker.close(reason);
		this.eventListeners.clear();
		this.requestHandler = null;
	}
	/** Registers the sole request dispatcher for this directed endpoint. */
	onRequest(handler) {
		this.requestHandler = handler;
		return this;
	}
	/** Registers a typed event listener and returns a cleanup function. */
	onEvent(type, listener) {
		const listeners = this.eventListeners.get(type) || new Set();
		listeners.add(listener);
		this.eventListeners.set(type, listeners);
		return () => listeners.delete(listener);
	}
	/** Sends one correlated request and returns its bounded response promise. */
	request(type, payload = {}) {
		const requestId = this.idFactory();
		const pending = this.broker.open(requestId, type);
		try {
			this.post(this.envelope(EMBED_KINDS.REQUEST, type, payload, requestId));
		} catch (error) {
			this.broker.reject(requestId, error);
		}
		return pending;
	}
	/** Sends one typed event without opening a pending request. */
	sendEvent(type, payload = {}) {
		this.post(this.envelope(EMBED_KINDS.EVENT, type, payload));
	}
	/** Posts only to the exact configured origin. */
	post(envelope) {
		this.targetWindow.postMessage(envelope, this.targetOrigin);
	}
	rejectMessage(reason, event) {
		this.rejectionHandler({
			reason,
			origin: event?.origin || "",
			hasSource: Boolean(event?.source)
		});
	}
	envelope(kind, type, payload, requestId = "") {
		return createEmbedEnvelope({
			channelId: this.channelId,
			requestId,
			kind,
			type,
			source: this.localId,
			target: this.remoteId,
			payload
		});
	}
}

export function createEmbedEndpoint(options = {}) {
	return new EmbedEndpoint(options).start();
}

function required(value, code) {
	if (!value) {
		throw new Error(code);
	}
	return value;
}

function defaultRequestId() {
	return globalThis.crypto?.randomUUID?.()
		|| `embed_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
