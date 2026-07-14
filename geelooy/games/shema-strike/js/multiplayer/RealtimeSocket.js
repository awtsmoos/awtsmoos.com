//B"H
// Boruch Hashem
// Blessed is He
/**
 * This transport adapter uses the existing public socket exactly as it stands.
 * The Awtsmoos renews opening and closing; Awtsmoos.com correlates only Shema
 * Strike requests while leaving every Eve and legacy packet untouched.
 */

import { APPLICATION_ID, createRequest, resolveSocketUrl } from "./protocol.js";
const REQUEST_TIMEOUT_MS = 8000;

export class RealtimeSocket {
	constructor(url = resolveSocketUrl(), WebSocketType = globalThis.WebSocket) {
		this.url = url;
		this.WebSocketType = WebSocketType;
		this.sequence = 0;
		this.pending = new Map();
		this.listeners = new Set();
		this.socket = null;
		this.connecting = null;
	}

	connect() {
		if (this.socket?.readyState === this.WebSocketType.OPEN) {
			return Promise.resolve();
		}
		if (this.connecting) {
			return this.connecting;
		}
		this.connecting = new Promise((resolve, reject) => {
			const socket = new this.WebSocketType(this.url);
			this.socket = socket;
			socket.addEventListener("open", () => resolve(), { once: true });
			socket.addEventListener("error", () => reject(new Error("Unable to open the multiplayer socket.")), { once: true });
			socket.addEventListener("message", (event) => this.handleMessage(event.data));
			socket.addEventListener("close", () => this.handleClose());
		}).finally(() => {
			this.connecting = null;
		});
		return this.connecting;
	}

	async request(type, payload = {}) {
		await this.connect();
		const request = this.nextRequest(type, payload);
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				this.pending.delete(request.requestId);
				reject(new Error("Multiplayer request timed out."));
			}, REQUEST_TIMEOUT_MS);
			this.pending.set(request.requestId, { reject, resolve, timer });
			this.socket.send(JSON.stringify(request));
		});
	}

	async send(type, payload = {}) {
		await this.connect();
		this.socket.send(JSON.stringify(this.nextRequest(type, payload)));
	}

	nextRequest(type, payload) {
		this.sequence += 1;
		return createRequest(type, payload, this.sequence);
	}

	onEvent(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	handleMessage(raw) {
		const message = JSON.parse(raw);
		if (message.application !== APPLICATION_ID) {
			return;
		}
		const pending = message.requestId ? this.pending.get(message.requestId) : null;
		if (pending) {
			clearTimeout(pending.timer);
			this.pending.delete(message.requestId);
			if (message.type === "error") {
				pending.reject(new Error(message.payload?.message || "Multiplayer request failed."));
			} else {
				pending.resolve(message);
			}
			return;
		}
		for (const listener of this.listeners) {
			listener(message);
		}
	}

	handleClose() {
		for (const pending of this.pending.values()) {
			clearTimeout(pending.timer);
			pending.reject(new Error("Multiplayer socket closed."));
		}
		this.pending.clear();
		this.socket = null;
	}

	close() {
		this.socket?.close();
	}
}
