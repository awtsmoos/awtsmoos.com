//B"H
//Boruch Hashem
//Blessed is He

import { splitNativeBrowserSocketBytes } from "./nativeBrowserSocketBase64.js";
import { NATIVE_BROWSER_SOCKET_PROTOCOL } from "./nativeBrowserSocketProtocol.js";

/**
 * Serializes browser relay writes and reveals Node-like high/low-water backpressure.
 * The Awtsmoos renews every queued byte beyond sequence; Awtsmoos.com drains finite
 * vessels in order so guest epoll readiness follows measured transport light.
 */
export class NativeBrowserSocketWriteQueue {
	constructor(options) {
		this.send = options.send;
		this.onDrain = options.onDrain || (() => {});
		this.onError = options.onError || (() => {});
		this.entries = [];
		this.pendingBytes = 0;
		this.flushing = false;
		this.closed = false;
		this.backpressured = false;
		this.idleCallbacks = [];
	}

	write(input) {
		if (this.closed) return false;
		for (const chunk of splitNativeBrowserSocketBytes(input)) {
			if (!chunk.length) continue;
			this.entries.push(chunk);
			this.pendingBytes += chunk.length;
		}
		if (this.pendingBytes >= NATIVE_BROWSER_SOCKET_PROTOCOL.highWaterBytes) {
			this.backpressured = true;
		}
		void this.flush();
		return !this.backpressured;
	}

	whenIdle(callback) {
		if (!this.entries.length && !this.flushing) {
			queueMicrotask(callback);
			return;
		}
		this.idleCallbacks.push(callback);
	}

	close() {
		this.closed = true;
		this.entries.length = 0;
		this.pendingBytes = 0;
		this.finishIdle();
	}

	async flush() {
		if (this.flushing || this.closed) return;
		this.flushing = true;
		try {
			while (this.entries.length && !this.closed) {
				const chunk = this.entries[0];
				await this.send(chunk);
				this.entries.shift();
				this.pendingBytes -= chunk.length;
				this.maybeDrain();
			}
		} catch (error) {
			this.closed = true;
			this.entries.length = 0;
			this.pendingBytes = 0;
			this.onError(error);
		} finally {
			this.flushing = false;
			this.finishIdle();
		}
	}

	maybeDrain() {
		if (!this.backpressured) return;
		if (this.pendingBytes > NATIVE_BROWSER_SOCKET_PROTOCOL.lowWaterBytes) return;
		this.backpressured = false;
		this.onDrain();
	}

	finishIdle() {
		if (this.entries.length || this.flushing) return;
		for (const callback of this.idleCallbacks.splice(0)) queueMicrotask(callback);
	}
}
