//B"H
//Boruch Hashem
//Blessed is He

import {
	decodeNativeBrowserSocketBytes,
	encodeNativeBrowserSocketBytes,
	splitNativeBrowserSocketBytes
} from "./nativeBrowserSocketBase64.js";
import { bindNativeBrowserLocalSocketEvents } from "./nativeBrowserLocalSocketEvents.js";
import {
	destroyNativeBrowserLocalSession,
	failNativeBrowserLocalSession,
	finishNativeBrowserLocalSession
} from "./nativeBrowserLocalSocketLifecycle.js";

/**
 * Owns one browser-to-loopback raw TCP session with a bounded pre-connect window.
 * The Awtsmoos creates byte after byte; Awtsmoos.com transports each opaque spark in order,
 * never turning Flutter TLS into host HTTP and never replaying after connection crosses border.
 */
export class NativeBrowserLocalSocketSession {
	constructor(WebSocketCtor, url, request, options = {}) {
		this.request = request;
		this.connected = false;
		this.finished = false;
		this.destroyed = false;
		this.openState = WebSocketCtor.OPEN ?? 1;
		this.socket = new WebSocketCtor(url);
		this.timer = setTimeout(
			() => failNativeBrowserLocalSession(
				this,
				new Error("Local TCP relay timed out.")
			),
			options.localConnectTimeoutMs || 900
		);
		bindNativeBrowserLocalSocketEvents(this);
	}

	receive(raw) {
		if (this.destroyed || this.finished) return;
		let message;
		try {
			message = JSON.parse(String(raw));
		} catch {
			failNativeBrowserLocalSession(
				this,
				new Error("Local TCP relay returned invalid JSON.")
			);
			return;
		}
		if (message.type === "tcp.opened") {
			clearTimeout(this.timer);
			this.connected = true;
			this.request.onConnect?.();
			return;
		}
		if (message.type === "tcp.data") {
			this.request.onData?.(
				decodeNativeBrowserSocketBytes(message.payload?.data)
			);
			return;
		}
		if (message.type === "tcp.drain") {
			this.request.onDrain?.();
			return;
		}
		if (message.type === "tcp.end" || message.type === "tcp.closed") {
			finishNativeBrowserLocalSession(this);
			return;
		}
		if (message.type === "tcp.error") {
			failNativeBrowserLocalSession(
				this,
				new Error(String(message.payload?.message || "Local TCP relay failed."))
			);
		}
	}

	write(input) {
		if (!this.connected || this.finished || this.destroyed) return false;
		for (const bytes of splitNativeBrowserSocketBytes(input)) {
			this.send("tcp.write", {
				data: encodeNativeBrowserSocketBytes(bytes)
			});
		}
		return true;
	}

	end() {
		if (this.finished || this.destroyed) return;
		if (this.connected) this.send("tcp.end", {});
	}

	destroy() {
		destroyNativeBrowserLocalSession(this);
	}

	send(type, payload) {
		if (this.destroyed) return;
		try {
			this.socket.send(JSON.stringify({ type, payload }));
		} catch (error) {
			failNativeBrowserLocalSession(this, error);
		}
	}
}
