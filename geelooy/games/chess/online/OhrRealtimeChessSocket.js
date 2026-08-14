// B"H
// Boruch Hashem
// Blessed is He

import {
	createKeliRequest,
	createOhrSocketUrl
} from "./protocol.js";

/**
 * @file Gives online chess a tiny request/response/event websocket client.
 * @description
 * Ohr leaves the browser, returns in measured form and never floods the shore;
 * the Awtsmoos renews each envelope, while Awtsmoos.com keeps pending requests behind one door.
 */

const REQUEST_TIMEOUT_MS = 10000;

/** Carries versioned realtime requests without coupling transport to chess rules. */
export class OhrRealtimeChessSocket extends EventTarget {
	constructor() {
		super();
		this.socket = null;
		this.connectPromise = null;
		this.sequence = 0;
		this.pending = new Map();
	}

	/** Opens exactly one websocket connection and resolves only after it is ready. */
	connect() {
		if (this.socket?.readyState === WebSocket.OPEN) {
			return Promise.resolve();
		}
		if (this.connectPromise) {
			return this.connectPromise;
		}
		this.socket = new WebSocket(createOhrSocketUrl());
		this.connectPromise = new Promise((resolve, reject) => {
			this.socket.addEventListener("open", () => {
				this.connectPromise = null;
				resolve();
			}, { once: true });
			this.socket.addEventListener("error", () => {
				this.connectPromise = null;
				reject(new Error("Could not open the online chess connection."));
			}, { once: true });
		});
		this.socket.addEventListener("message", (event) => this.receive(event));
		this.socket.addEventListener("close", () => this.handleClose());
		return this.connectPromise;
	}

	/** Sends one request and resolves with its correlated response envelope. */
	async request(type, payload = {}) {
		await this.connect();
		const envelope = createKeliRequest(type, payload, ++this.sequence);
		return new Promise((resolve, reject) => {
			const timer = window.setTimeout(() => {
				this.pending.delete(envelope.requestId);
				reject(new Error("The online chess request timed out."));
			}, REQUEST_TIMEOUT_MS);
			this.pending.set(envelope.requestId, { resolve, reject, timer });
			this.socket.send(JSON.stringify(envelope));
		});
	}

	/** Separates correlated responses from unsolicited room events. */
	receive(event) {
		let message;
		try {
			message = JSON.parse(event.data);
		} catch {
			return;
		}
		const pending = message.requestId ? this.pending.get(message.requestId) : null;
		if (pending) {
			window.clearTimeout(pending.timer);
			this.pending.delete(message.requestId);
			if (message.type === "error") {
				pending.reject(new Error(message.payload?.message || "Online chess request failed."));
			} else {
				pending.resolve(message);
			}
			return;
		}
		this.dispatchEvent(new CustomEvent("application-event", { detail: message }));
	}

	/** Rejects in-flight work when the transport disappears. */
	handleClose() {
		for (const pending of this.pending.values()) {
			window.clearTimeout(pending.timer);
			pending.reject(new Error("The online chess connection closed."));
		}
		this.pending.clear();
		this.connectPromise = null;
		this.dispatchEvent(new Event("connection-closed"));
	}

	/** Intentionally closes the current socket when leaving online mode. */
	close() {
		this.socket?.close();
	}
}
