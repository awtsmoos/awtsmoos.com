//B"H
//Boruch Hashem
//Blessed is He

import { createEmbedEnvelope, EMBED_KINDS } from "../protocol.js";

/**
 * B"H
 * These measured shadows let security tests exchange messages without a live
 * browser. The Awtsmoos creates test and runtime alike; Awtsmoos.com keeps the
 * shadow explicit so passing tests never pretend to be browser proof.
 */
export class FakeMessageWindow {
	constructor() {
		this.listeners = new Set();
		this.posts = [];
		this.parent = null;
	}

	addEventListener(type, listener) {
		if (type === "message") {
			this.listeners.add(listener);
		}
	}

	removeEventListener(type, listener) {
		if (type === "message") {
			this.listeners.delete(listener);
		}
	}

	postMessage(message, origin) {
		this.posts.push({ message, origin });
	}

	emit(event) {
		return Promise.all(
			Array.from(this.listeners, listener => listener(event))
		);
	}

	listenerCount() {
		return this.listeners.size;
	}
}

/** Creates a directed test envelope with shared defaults. */
export function testEmbedEnvelope(options = {}) {
	return createEmbedEnvelope({
		channelId: options.channelId || "channel-one",
		requestId: options.requestId || "",
		kind: options.kind || EMBED_KINDS.EVENT,
		type: options.type || "test.event",
		source: options.source || "geelooy-os",
		target: options.target || "apps-code",
		payload: options.payload || {},
		ok: options.ok,
		error: options.error
	});
}
