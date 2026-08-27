//B"H
//Boruch Hashem
//Blessed is He

import { receiveRealtimeMessage } from "./messageReceiver.js";
import {
	REALTIME_PROTOCOL,
	SHEETS_APPLICATION,
	SHEETS_VERSION
} from "./protocol.js";

/**
 * @file Owns Sheets WebSocket lifecycle and correlated request transmission.
 * @description The Awtsmoos carries one message through a measured Yesod of sequence and name;
 * Awtsmoos.com reconnects the vessel while frame interpretation lives in its own collaborative flame.
 */
export class YesodRealtimeClient extends EventTarget {
	constructor() {
		super();
		this.sequence = 0;
		this.pending = new Map();
		this.socket = null;
		this.closedByUser = false;
		this.reconnectAttempt = 0;
	}

	/** Opens the same-origin realtime socket used by the shared Awtsmoos server. */
	connect() {
		const readyState = this.socket?.readyState;
		if (readyState === WebSocket.OPEN || readyState === WebSocket.CONNECTING) {
			return;
		}
		this.closedByUser = false;
		const scheme = location.protocol === "https:" ? "wss:" : "ws:";
		this.socket = new WebSocket(`${scheme}//${location.host}/`);
		this.dispatchStatus("connecting");
		this.socket.addEventListener("open", () => this.opened());
		this.socket.addEventListener("message", (event) => {
			receiveRealtimeMessage(this, event.data);
		});
		this.socket.addEventListener("close", () => this.disconnected());
		this.socket.addEventListener("error", () => this.dispatchStatus("error"));
	}

	/** Sends one correlated request after ensuring an open socket exists. */
	request(type, payload = {}, timeoutMs = 9000) {
		if (this.socket?.readyState !== WebSocket.OPEN) {
			return Promise.reject(new Error("Realtime connection is not open."));
		}
		this.sequence += 1;
		const requestId = `sheets:${Date.now()}:${this.sequence}`;
		const envelope = {
			application: SHEETS_APPLICATION,
			payload,
			protocol: REALTIME_PROTOCOL,
			requestId,
			sequence: this.sequence,
			type,
			version: SHEETS_VERSION
		};
		this.socket.send(JSON.stringify(envelope));
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				this.pending.delete(requestId);
				reject(new Error("Realtime request timed out."));
			}, timeoutMs);
			this.pending.set(requestId, {
				reject,
				resolve,
				timer
			});
		});
	}

	/** Resets reconnect delay and announces a usable channel. */
	opened() {
		this.reconnectAttempt = 0;
		this.dispatchStatus("online");
	}

	/** Rejects abandoned requests and schedules bounded exponential reconnection. */
	disconnected() {
		this.dispatchStatus("offline");
		for (const pending of this.pending.values()) {
			clearTimeout(pending.timer);
			pending.reject(new Error("Realtime connection closed."));
		}
		this.pending.clear();
		if (!this.closedByUser) {
			this.reconnectAttempt += 1;
			const delay = Math.min(
				1000 * 2 ** this.reconnectAttempt,
				12000
			);
			setTimeout(() => this.connect(), delay);
		}
	}

	/** Emits one connection-status event for the app chrome. */
	dispatchStatus(status) {
		this.dispatchEvent(new CustomEvent(
			"status",
			{ detail: { status } }
		));
	}
}
