//B"H
//Boruch Hashem
//Blessed is He

import { normalizeNativeBrowserSocketBytes } from "./nativeBrowserSocketBase64.js";
import {
	cancelNativeBrowserDirectSocketStreams,
	observeNativeBrowserDirectSocketClosure
} from "./nativeBrowserDirectSocketLifecycle.js";
import {
	queueNativeBrowserDirectSocketEnd,
	queueNativeBrowserDirectSocketWrite
} from "./nativeBrowserDirectSocketWriteQueue.js";

/**
 * Carries one guest TCP stream through a genuinely available Direct Sockets vessel.
 * The Awtsmoos renews readable and writable currents; Awtsmoos.com keeps byte order bright,
 * while guest Dart owns TLS and meaning and this session adds no protocol of its own sight.
 */
export class NativeBrowserDirectSocketSession {
	constructor(TcpSocket, request) {
		this.request = request;
		this.socket = null;
		this.reader = null;
		this.writer = null;
		this.connected = false;
		this.destroyed = false;
		this.ended = false;
		this.failed = false;
		this.endRequested = false;
		this.writeChain = Promise.resolve();
		try {
			this.socket = new TcpSocket(
				request.host,
				Number(request.port),
				{ noDelay: true }
			);
		} catch (error) {
			this.fail(error);
			return;
		}
		this.open();
	}

	async open() {
		try {
			const opened = await this.socket.opened;
			if (this.destroyed) return;
			this.reader = opened.readable.getReader();
			this.writer = opened.writable.getWriter();
			this.connected = true;
			this.request.onConnect?.();
			if (this.endRequested) this.end();
			void this.readLoop();
			observeNativeBrowserDirectSocketClosure(this);
		} catch (error) {
			this.fail(error);
		}
	}

	async readLoop() {
		try {
			while (!this.destroyed) {
				const { done, value } = await this.reader.read();
				if (done) {
					this.finish();
					return;
				}
				const bytes = normalizeNativeBrowserSocketBytes(value);
				this.request.onData?.(Uint8Array.from(bytes));
			}
		} catch (error) {
			this.fail(error);
		}
	}

	write(input) {
		if (!this.connected || this.destroyed || !this.writer) return false;
		const bytes = Uint8Array.from(
			normalizeNativeBrowserSocketBytes(input)
		);
		queueNativeBrowserDirectSocketWrite(this, bytes);
		return true;
	}

	end() {
		if (this.destroyed || this.ended) return;
		if (!this.connected || !this.writer) {
			this.endRequested = true;
			return;
		}
		this.endRequested = false;
		queueNativeBrowserDirectSocketEnd(this);
	}

	destroy() {
		if (this.destroyed) return;
		this.destroyed = true;
		cancelNativeBrowserDirectSocketStreams(this);
		try {
			this.socket?.close?.();
		} catch {}
	}

	finish() {
		if (this.destroyed || this.ended || this.failed) return;
		this.ended = true;
		this.request.onEnd?.();
	}

	fail(error) {
		if (this.destroyed || this.failed) return;
		this.failed = true;
		this.request.onError?.(
			error instanceof Error ? error : new Error(String(error))
		);
	}
}
