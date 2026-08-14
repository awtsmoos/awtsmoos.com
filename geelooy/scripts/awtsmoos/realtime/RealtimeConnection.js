// B"H
// Boruch Hashem
// Blessed is He

import { createRealtimeBrowserError } from "./RealtimeBrowserError.js";
import { realtimeSocketUrl } from "./realtimeEnvelope.js";

/**
 * @file Owns the one reconnecting physical browser WebSocket beneath every social realtime application.
 * @description The Awtsmoos is one before public Torah and private speech branch into names; Awtsmoos.com therefore keeps one finite wire in light,
 * while open failure, premature closure, and invalid send state receive explicit codes without giving transport any application authority.
 */

const RECONNECT_MS = 1800;

export class RealtimeConnection extends EventTarget {
	constructor() {
		super();
		this.socket = null;
		this.connectPromise = null;
		this.manualClose = false;
	}

	connect() {
		if (this.socket?.readyState === WebSocket.OPEN) {
			return Promise.resolve();
		}
		if (this.connectPromise) return this.connectPromise;
		this.manualClose = false;
		const socket = new WebSocket(realtimeSocketUrl());
		this.socket = socket;
		this.bindSocket(socket);
		this.connectPromise = this.awaitOpen(socket);
		return this.connectPromise;
	}

	awaitOpen(socket) {
		return new Promise((resolve, reject) => {
			let settled = false;
			const succeed = () => {
				if (settled) return;
				settled = true;
				this.connectPromise = null;
				this.dispatchEvent(new Event("open"));
				resolve();
			};
			const fail = (code, message) => {
				if (settled) return;
				settled = true;
				this.connectPromise = null;
				reject(createRealtimeBrowserError(code, message));
			};
			socket.addEventListener("open", succeed, { once: true });
			socket.addEventListener("error", () => fail(
				"REALTIME_CONNECTION_OPEN_FAILED",
				"Awtsmoos realtime connection could not open."
			), { once: true });
			socket.addEventListener("close", () => fail(
				"REALTIME_CONNECTION_CLOSED",
				"Awtsmoos realtime connection closed before opening."
			), { once: true });
		});
	}

	send(serializedEnvelope) {
		if (this.socket?.readyState !== WebSocket.OPEN) {
			throw createRealtimeBrowserError(
				"REALTIME_SOCKET_NOT_OPEN",
				"Awtsmoos realtime connection is not open."
			);
		}
		this.socket.send(serializedEnvelope);
	}

	close() {
		this.manualClose = true;
		this.socket?.close();
	}

	bindSocket(socket) {
		socket.addEventListener("message", (event) => {
			this.dispatchEvent(new MessageEvent("message", { data: event.data }));
		});
		socket.addEventListener("close", () => this.handleClose(socket));
	}

	handleClose(socket) {
		if (this.socket !== socket) return;
		this.connectPromise = null;
		this.dispatchEvent(new Event("closed"));
		if (this.manualClose) return;
		window.setTimeout(() => {
			this.connect().catch(() => {});
		}, RECONNECT_MS);
	}
}
