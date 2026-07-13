//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * The browser sends ordered requests and receives both answers and living events.
 * The Awtsmoos renews every connection; Awtsmoos.com correlates responses,
 * bounds waiting time, and reveals closure without silently losing promises.
 */

import {
	createRequestEnvelope,
	createRequestId,
	sameOriginSocketUrl
} from "./ProtocolEnvelope.js";

/** Owns one versioned WebSocket connection for a registered application. */
export class RealtimeClient {
	constructor(application, version = 1, url = sameOriginSocketUrl()) {
		this.application = application;
		this.version = version;
		this.url = url;
		this.sequence = 0;
		this.socket = null;
		this.connectionPromise = null;
		this.listeners = new Map();
		this.pending = new Map();
	}

	/** Opens the socket once and resolves when its handshake completes. */
	connect() {
		if (this.socket?.readyState === WebSocket.OPEN) {
			return Promise.resolve();
		}
		if (this.connectionPromise) {
			return this.connectionPromise;
		}

		this.connectionPromise = new Promise((resolve, reject) => {
			const socket = new WebSocket(this.url);
			this.socket = socket;
			socket.addEventListener("open", () => {
				this.connectionPromise = null;
				this.emit("connection.open", {});
				resolve();
			});
			socket.addEventListener("message", event => {
				this.receive(event.data);
			});
			socket.addEventListener("close", event => {
				this.handleClose(event);
			});
			socket.addEventListener("error", () => {
				reject(new Error("Real-time connection could not be opened."));
			});
		});
		return this.connectionPromise;
	}

	/** Sends one correlated request and resolves with its payload. */
	async request(type, payload = {}) {
		await this.connect();
		const requestId = createRequestId();
		const envelope = createRequestEnvelope({
			application: this.application,
			payload,
			requestId,
			sequence: ++this.sequence,
			type,
			version: this.version
		});
		return new Promise((resolve, reject) => {
			const timer = window.setTimeout(() => {
				this.pending.delete(requestId);
				reject(new Error(`Real-time request timed out: ${type}`));
			}, 8000);
			this.pending.set(requestId, { reject, resolve, timer });
			this.socket.send(JSON.stringify(envelope));
		});
	}

	/** Subscribes to one application or connection event type. */
	on(type, listener) {
		const listeners = this.listeners.get(type) || new Set();
		listeners.add(listener);
		this.listeners.set(type, listeners);
		return () => {
			listeners.delete(listener);
		};
	}

	receive(rawMessage) {
		const message = JSON.parse(rawMessage);
		const pending = message.requestId
			? this.pending.get(message.requestId)
			: null;
		if (pending) {
			window.clearTimeout(pending.timer);
			this.pending.delete(message.requestId);
			if (message.type === "error") {
				pending.reject(new Error(message.payload?.message || "Request failed."));
				return;
			}
			pending.resolve(message.payload || {});
			return;
		}
		this.emit(message.type, message.payload || {});
	}

	handleClose(event) {
		this.connectionPromise = null;
		this.socket = null;
		for (const pending of this.pending.values()) {
			window.clearTimeout(pending.timer);
			pending.reject(new Error("Real-time connection closed."));
		}
		this.pending.clear();
		this.emit("connection.closed", { code: event.code });
	}

	emit(type, payload) {
		for (const listener of this.listeners.get(type) || []) {
			listener(payload);
		}
	}
}
