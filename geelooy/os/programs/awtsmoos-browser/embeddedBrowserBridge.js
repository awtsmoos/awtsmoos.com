//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedBrowserBridge
 * @description The Awtsmoos joins host and guest by source, channel, and measured word;
 * Awtsmoos.com never mistakes an opaque origin for identity, but tests the exact
 * WindowProxy and protocol vessel before any message may cross or be heard.
 */

import {
	GuestToHostType,
	hostMessage,
	isGuestMessage
} from "./embeddedGuestProtocol.js";

export class EmbeddedBrowserBridge {
	constructor(options = {}) {
		this.frame = options.frame;
		this.channelId = options.channelId || options.frame?.channelId;
		this.windowObject = options.windowObject || globalThis.window;
		this.handlers = new Map();
		this.boundMessage = event => this.receive(event);
		if (!this.frame?.iframe || !this.channelId || !this.windowObject?.addEventListener) {
			throw new TypeError("BROWSER_EMBEDDED_BRIDGE_INVALID");
		}
		this.windowObject.addEventListener("message", this.boundMessage);
	}

	on(type, handler) {
		if (!Object.values(GuestToHostType).includes(type) || typeof handler !== "function") {
			throw new TypeError("BROWSER_EMBEDDED_HANDLER_INVALID");
		}
		if (!this.handlers.has(type)) this.handlers.set(type, new Set());
		this.handlers.get(type).add(handler);
		return () => this.handlers.get(type)?.delete(handler);
	}

	send(type, payload = null) {
		const message = hostMessage(this.channelId, type, payload);
		const target = this.frame.iframe.contentWindow;
		if (!target?.postMessage) throw new Error("BROWSER_EMBEDDED_FRAME_UNAVAILABLE");
		target.postMessage(message, "*");
		return message;
	}

	destroy() {
		this.windowObject.removeEventListener?.("message", this.boundMessage);
		this.handlers.clear();
	}

	receive(event) {
		if (event?.source !== this.frame.iframe.contentWindow) return false;
		if (!isGuestMessage(event.data, this.channelId)) return false;
		for (const handler of this.handlers.get(event.data.type) || []) {
			try {
				handler(event.data.payload, event.data);
			} catch (error) {
				queueMicrotask(() => { throw error; });
			}
		}
		return true;
	}
}
