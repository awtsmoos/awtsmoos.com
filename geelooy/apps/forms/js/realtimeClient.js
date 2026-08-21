//B"H
//Boruch Hashem
//Blessed is He

import {
	FORMS_APPLICATION,
	FORMS_VERSION,
	REALTIME_PROTOCOL
} from "./protocol.js";

/**
 * @file Owns Forms WebSocket lifecycle and correlated versioned request transmission.
 * @description The Awtsmoos carries editor and respondent messages through one measured realtime vessel;
 * Awtsmoos.com correlates every reply while reconnect logic remains outside form-definition truth.
 */
export class YesodFormsRealtimeClient extends EventTarget {
	constructor() {
		super();
		this.sequence = 0;
		this.pending = new Map();
		this.socket = null;
		this.reconnectAttempt = 0;
	}

	/** Opens the same-origin Awtsmoos realtime socket when not already open or connecting. */
	connect() {
		if ([WebSocket.OPEN, WebSocket.CONNECTING].includes(this.socket?.readyState)) {
			return;
		}
		const scheme = location.protocol === "https:" ? "wss:" : "ws:";
		this.socket = new WebSocket(`${scheme}//${location.host}/`);
		this.status("connecting");
		this.socket.addEventListener("open", () => {
			this.reconnectAttempt = 0;
			this.status("online");
		});
		this.socket.addEventListener("message", (event) => this.receive(event.data));
		this.socket.addEventListener("close", () => this.disconnected());
		this.socket.addEventListener("error", () => this.status("error"));
	}

	/** Sends one correlated Forms request after the socket becomes usable. */
	request(type, payload = {}, timeoutMs = 10000) {
		if (this.socket?.readyState !== WebSocket.OPEN) {
			return Promise.reject(new Error("Realtime connection is not open."));
		}
		this.sequence += 1;
		const requestId = `forms:${Date.now()}:${this.sequence}`;
		this.socket.send(JSON.stringify({
			application: FORMS_APPLICATION,
			payload,
			protocol: REALTIME_PROTOCOL,
			requestId,
			sequence: this.sequence,
			type,
			version: FORMS_VERSION
		}));
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				this.pending.delete(requestId);
				reject(new Error("Forms request timed out."));
			}, timeoutMs);
			this.pending.set(requestId, { reject, resolve, timer });
		});
	}

	/** Parses one Forms response frame and settles its matching promise. */
	receive(raw) {
		let message;
		try {
			message = JSON.parse(raw);
		} catch {
			return;
		}
		if (message?.application !== FORMS_APPLICATION || message?.protocol !== REALTIME_PROTOCOL) {
			return;
		}
		const pending = this.pending.get(message.requestId);
		if (!pending) {
			return;
		}
		clearTimeout(pending.timer);
		this.pending.delete(message.requestId);
		if (message.type === "error") {
			pending.reject(responseError(message.payload));
			return;
		}
		pending.resolve(message.payload || {});
	}

	/** Rejects abandoned requests and schedules bounded exponential reconnection. */
	disconnected() {
		this.status("offline");
		for (const pending of this.pending.values()) {
			clearTimeout(pending.timer);
			pending.reject(new Error("Realtime connection closed."));
		}
		this.pending.clear();
		this.reconnectAttempt += 1;
		setTimeout(
			() => this.connect(),
			Math.min(1000 * (2 ** this.reconnectAttempt), 12000)
		);
	}

	/** Emits connection state for the Forms shell. */
	status(status) {
		this.dispatchEvent(new CustomEvent("status", { detail: { status } }));
	}
}

function responseError(payload = {}) {
	const error = new Error(payload.message || "Forms request failed.");
	error.code = payload.code || "FORMS_ERROR";
	error.details = payload.details || null;
	return error;
}
