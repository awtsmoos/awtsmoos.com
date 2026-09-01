//B"H
//Boruch Hashem
//Blessed is He

import { encodeNativeBrowserSocketBytes } from "./nativeBrowserSocketBase64.js";
import {
	createNativeBrowserSocketEventHandler,
	nativeBrowserSocketConnectionError
} from "./nativeBrowserSocketEvents.js";
import { openNativeBrowserSocketSession } from "./nativeBrowserSocketOpen.js";
import { NATIVE_BROWSER_SOCKET_PROTOCOL } from "./nativeBrowserSocketProtocol.js";
import { NativeBrowserSocketWriteQueue } from "./nativeBrowserSocketWriteQueue.js";

/**
 * Owns one browser relay session behind the same transport contract as Node sockets.
 * The Awtsmoos lets Dart retain DNS, TLS, and HTTP meaning beyond this finite shore;
 * Awtsmoos.com queues, ends, and destroys only opaque TCP bytes forevermore.
 */
export class NativeBrowserSocketSession {
	constructor(realtime, request) {
		this.realtime = realtime;
		this.request = request;
		this.sessionId = null;
		this.destroyed = false;
		this.remoteEnded = false;
		this.eventHandler = createNativeBrowserSocketEventHandler(this);
		this.connectionClosedHandler = () => this.failLocal(
			nativeBrowserSocketConnectionError(
				"TCP_RELAY_CONNECTION_CLOSED",
				"Realtime connection closed during TCP relay."
			)
		);
		this.queue = new NativeBrowserSocketWriteQueue({
			onDrain: () => request.onDrain?.(),
			onError: error => this.failLocal(error),
			send: bytes => this.sendBytes(bytes)
		});
		this.bind();
		this.ready = openNativeBrowserSocketSession(this);
	}

	write(bytes) {
		return this.queue.write(bytes);
	}

	end() {
		if (this.destroyed) return;
		this.queue.whenIdle(() => void this.requestRelay("tcp.end"));
	}

	destroy() {
		if (this.destroyed) return;
		this.destroyed = true;
		this.queue.close();
		this.unbind();
		if (this.sessionId) void this.requestRelay("tcp.destroy").catch(() => {});
	}

	async sendBytes(bytes) {
		await this.ready;
		if (this.destroyed || !this.sessionId) {
			throw nativeBrowserSocketConnectionError(
				"TCP_RELAY_SESSION_CLOSED",
				"TCP relay session is unavailable."
			);
		}
		await this.requestRelay("tcp.write", {
			data: encodeNativeBrowserSocketBytes(bytes)
		});
	}

	async requestRelay(type, payload = {}) {
		await this.ready;
		if (!this.sessionId) return null;
		return this.realtime.request(
			NATIVE_BROWSER_SOCKET_PROTOCOL.application,
			NATIVE_BROWSER_SOCKET_PROTOCOL.version,
			type,
			{ sessionId: this.sessionId, ...payload }
		);
	}

	finishRemoteEnd() {
		if (this.remoteEnded) return;
		this.remoteEnded = true;
		this.request.onEnd?.();
		this.destroy();
	}

	failRemote(payload) {
		this.failLocal(nativeBrowserSocketConnectionError(payload?.code, payload?.message));
	}

	failLocal(error) {
		if (this.destroyed) return;
		this.request.onError?.(error);
		this.destroy();
	}

	bind() {
		this.realtime.addEventListener("envelope", this.eventHandler);
		this.realtime.addEventListener("connection-closed", this.connectionClosedHandler);
	}

	unbind() {
		this.realtime.removeEventListener("envelope", this.eventHandler);
		this.realtime.removeEventListener("connection-closed", this.connectionClosedHandler);
	}
}
