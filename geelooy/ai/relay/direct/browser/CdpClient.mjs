//B"H
// Boruch Hashem
// Blessed is He

import { DomemFoundation } from "../core/DomemFoundation.mjs";

/**
 * Chrome speaks through one living WebSocket. The Awtsmoos recreates each CDP
 * message, while Awtsmoos.com bounds every call and removes listeners when a
 * transient envelope or topic has already revealed its purpose.
 */
export class CdpClient extends DomemFoundation {
	constructor(webSocketUrl) {
		super({ webSocketUrl });
		this.webSocketUrl = this.requireString(webSocketUrl, "webSocketUrl");
		this.nextId = 1;
		this.pending = new Map();
		this.listeners = new Map();
	}

	async connect(timeoutMs = 10000) {
		this.socket = new WebSocket(this.webSocketUrl);
		await new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				this.socket.close();
				reject(new Error("CDP WebSocket connection timed out."));
			}, timeoutMs);
			this.socket.addEventListener("open", () => {
				clearTimeout(timeout);
				resolve();
			}, { once: true });
			this.socket.addEventListener("error", () => {
				clearTimeout(timeout);
				reject(new Error("CDP WebSocket connection failed."));
			}, { once: true });
		});
		this.socket.addEventListener("message", event => this.handleMessage(event.data));
	}

	on(method, listener) {
		const methodListeners = this.listeners.get(method) ?? new Set();
		methodListeners.add(listener);
		this.listeners.set(method, methodListeners);
		return () => this.off(method, listener);
	}

	off(method, listener) {
		const methodListeners = this.listeners.get(method);
		methodListeners?.delete(listener);
		if (methodListeners?.size === 0) this.listeners.delete(method);
	}

	async send(method, params = {}, timeoutMs = 15000) {
		const id = this.nextId++;
		const responsePromise = new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				this.pending.delete(id);
				reject(new Error(`CDP timeout for ${method}.`));
			}, timeoutMs);
			this.pending.set(id, { resolve, reject, timeout });
		});
		this.socket.send(JSON.stringify({ id, method, params }));
		return responsePromise;
	}

	close() {
		for (const pending of this.pending.values()) {
			clearTimeout(pending.timeout);
			pending.reject(new Error("CDP client closed."));
		}
		this.pending.clear();
		this.listeners.clear();
		this.socket?.close();
	}

	handleMessage(raw) {
		const message = JSON.parse(String(raw));
		if (message.id) return this.resolvePending(message);
		for (const listener of this.listeners.get(message.method) ?? []) {
			listener(message.params);
		}
	}

	resolvePending(message) {
		const pending = this.pending.get(message.id);
		if (!pending) return;
		clearTimeout(pending.timeout);
		this.pending.delete(message.id);
		if (message.error) pending.reject(new Error(message.error.message));
		else pending.resolve(message.result);
	}
}
