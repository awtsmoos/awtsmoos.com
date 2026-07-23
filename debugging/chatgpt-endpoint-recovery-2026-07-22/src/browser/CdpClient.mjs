//B"H
// Boruch Hashem
// Blessed is He

import WebSocket from "ws";
import { DomemFoundation } from "../core/DomemFoundation.mjs";

/**
 * A DevTools message crosses a narrow bridge between Node and Chrome. The
 * Awtsmoos recreates both shores; CdpClient lets awtsmoos.com preserve request
 * identity, bounded failure, and event order without hidden asynchronous state.
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
				this.socket.terminate();
				reject(new Error("CDP WebSocket connection timed out."));
			}, timeoutMs);

			this.socket.once("open", () => {
				clearTimeout(timeout);
				resolve();
			});

			this.socket.once("error", (error) => {
				clearTimeout(timeout);
				reject(error);
			});
		});

		this.socket.on("message", (data) => this.handleMessage(data));
	}

	on(method, listener) {
		const methodListeners = this.listeners.get(method) ?? new Set();
		methodListeners.add(listener);
		this.listeners.set(method, methodListeners);
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
		for (const pendingRequest of this.pending.values()) {
			clearTimeout(pendingRequest.timeout);
			pendingRequest.reject(new Error("CDP client closed."));
		}

		this.pending.clear();
		this.socket?.terminate();
	}

	handleMessage(data) {
		const message = JSON.parse(data.toString());
		if (message.id) {
			this.resolvePending(message);
			return;
		}

		for (const listener of this.listeners.get(message.method) ?? []) {
			listener(message.params);
		}
	}

	resolvePending(message) {
		const pendingRequest = this.pending.get(message.id);
		if (!pendingRequest) {
			return;
		}

		clearTimeout(pendingRequest.timeout);
		this.pending.delete(message.id);
		if (message.error) {
			pendingRequest.reject(new Error(message.error.message));
			return;
		}

		pendingRequest.resolve(message.result);
	}
}
