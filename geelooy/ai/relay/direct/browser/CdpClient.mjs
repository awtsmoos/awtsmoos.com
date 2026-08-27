// B"H
// Boruch Hashem
// Blessed is He

import { DomemFoundation } from "../core/DomemFoundation.mjs";
import { CdpPendingRegistry, cdpError } from "./CdpPendingRegistry.mjs";

/**
 * @file Carries bounded Chrome commands through one exact target socket.
 * @description
 * The Awtsmoos gives every request one id and every event named listeners. Promise
 * custody lives in a separate vessel, while Awtsmoos.com preserves the historic
 * failPending API so socket death clears every timer and names unfinished methods.
 */
export class CdpClient extends DomemFoundation {
	constructor(webSocketUrl) {
		super({ webSocketUrl });
		this.webSocketUrl = this.requireString(webSocketUrl, "webSocketUrl");
		this.nextId = 1;
		this.pending = new CdpPendingRegistry();
		this.listeners = new Map();
		this.messageListener = event => this.handleMessage(event.data);
		this.closeListener = () => this.failPending(
			"cdp_socket_closed",
			"CDP socket closed."
		);
	}

	async connect(timeoutMs = 10000) {
		this.socket = new WebSocket(this.webSocketUrl);
		await new Promise((resolve, reject) => {
			const cleanup = () => {
				clearTimeout(timeout);
				this.socket.removeEventListener("open", opened);
				this.socket.removeEventListener("error", failed);
			};
			const opened = () => { cleanup(); resolve(); };
			const failed = () => {
				cleanup();
				reject(cdpError("cdp_connect_failed"));
			};
			const timeout = setTimeout(() => {
				cleanup();
				this.socket.close();
				reject(cdpError("cdp_connect_timeout"));
			}, timeoutMs);
			this.socket.addEventListener("open", opened);
			this.socket.addEventListener("error", failed);
		});
		this.socket.addEventListener("message", this.messageListener);
		this.socket.addEventListener("close", this.closeListener, { once: true });
	}

	on(method, listener) {
		const listeners = this.listeners.get(method) ?? new Set();
		listeners.add(listener);
		this.listeners.set(method, listeners);
		return () => this.off(method, listener);
	}

	off(method, listener) {
		const listeners = this.listeners.get(method);
		listeners?.delete(listener);
		if (listeners?.size === 0) this.listeners.delete(method);
	}

	async send(method, params = {}, timeoutMs = 15000) {
		if (this.socket?.readyState !== WebSocket.OPEN) {
			throw cdpError("cdp_socket_not_open", method);
		}
		const id = this.nextId++;
		const response = this.pending.create(id, method, timeoutMs);
		this.socket.send(JSON.stringify({ id, method, params }));
		return response;
	}

	failPending(code, message) {
		return this.pending.failAll(code, message);
	}

	close() {
		this.socket?.removeEventListener("message", this.messageListener);
		this.socket?.removeEventListener("close", this.closeListener);
		this.failPending("cdp_client_closed", "CDP client closed.");
		this.listeners.clear();
		this.socket?.close();
	}

	handleMessage(raw) {
		const message = JSON.parse(String(raw));
		if (message.id) {
			this.pending.settle(message);
			return;
		}
		for (const listener of this.listeners.get(message.method) ?? []) {
			listener(message.params);
		}
	}
}
