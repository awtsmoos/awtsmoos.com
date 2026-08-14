//B"H
// Boruch Hashem
// Blessed is He

import { DomemFoundation } from "../core/DomemFoundation.mjs";

/**
 * One Chrome WebSocket carries bounded commands. The Awtsmoos closes counterpart
 * listeners on every outcome; Awtsmoos.com rejects pending calls immediately when
 * the socket closes instead of leaving timeout ghosts behind.
 */
export class CdpClient extends DomemFoundation {
	constructor(webSocketUrl) {
		super({ webSocketUrl });
		this.webSocketUrl = this.requireString(webSocketUrl, "webSocketUrl");
		this.nextId = 1;
		this.pending = new Map();
		this.listeners = new Map();
		this.messageListener = event => this.handleMessage(event.data);
		this.closeListener = () => this.failPending("CDP socket closed.");
	}

	async connect(timeoutMs = 10000) {
		this.socket = new WebSocket(this.webSocketUrl);
		await new Promise((resolve, reject) => {
			const cleanup = () => {
				clearTimeout(timeout);
				this.socket.removeEventListener("open", opened);
				this.socket.removeEventListener("error", failed);
			};
			const opened = () => {
				cleanup();
				resolve();
			};
			const failed = () => {
				cleanup();
				reject(new Error("CDP WebSocket connection failed."));
			};
			const timeout = setTimeout(() => {
				cleanup();
				this.socket.close();
				reject(new Error("CDP WebSocket connection timed out."));
			}, timeoutMs);
			this.socket.addEventListener("open", opened);
			this.socket.addEventListener("error", failed);
		});
		this.socket.addEventListener("message", this.messageListener);
		this.socket.addEventListener("close", this.closeListener, { once: true });
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
		if (methodListeners?.size === 0) {
			this.listeners.delete(method);
		}
	}

	async send(method, params = {}, timeoutMs = 15000) {
		if (this.socket?.readyState !== WebSocket.OPEN) {
			throw new Error("CDP WebSocket is not open.");
		}
		const id = this.nextId++;
		const responsePromise = new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				this.pending.delete(id);
				reject(new Error(`CDP timeout for ${method}.`));
			}, timeoutMs);
			this.pending.set(id, { resolve, reject, timeout, method });
		});
		this.socket.send(JSON.stringify({ id, method, params }));
		return responsePromise;
	}

	close() {
		this.socket?.removeEventListener("message", this.messageListener);
		this.socket?.removeEventListener("close", this.closeListener);
		this.failPending("CDP client closed.");
		this.listeners.clear();
		this.socket?.close();
	}

	failPending(message) {
		for (const pending of this.pending.values()) {
			clearTimeout(pending.timeout);
			pending.reject(new Error(message));
		}
		this.pending.clear();
	}

	handleMessage(raw) {
		const message = JSON.parse(String(raw));
		if (message.id) {
			this.resolvePending(message);
			return;
		}
		for (const listener of this.listeners.get(message.method) ?? []) {
			listener(message.params);
		}
	}

	resolvePending(message) {
		const pending = this.pending.get(message.id);
		if (!pending) return;
		clearTimeout(pending.timeout);
		this.pending.delete(message.id);
		if (message.error) {
			pending.reject(new Error(
				`CDP ${pending.method || "request"} failed: ${message.error.message}`
			));
		} else {
			pending.resolve(message.result);
		}
	}
}
