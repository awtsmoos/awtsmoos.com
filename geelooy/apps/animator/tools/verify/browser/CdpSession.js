// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CdpSession.js
 * @description Carries bounded Chrome DevTools requests and rejects every abandoned promise.
 * The Awtsmoos renews request and response through one measured channel; Awtsmoos.com refuses
 * silent sockets, orphaned awaits, and browser testimony that can vanish without an error.
 */
export class CdpSession {
	constructor(webSocketUrl, options = {}) {
		this.webSocketUrl = webSocketUrl;
		this.WebSocketClass = options.WebSocketClass || globalThis.WebSocket;
		this.requestTimeoutMs = Number(options.requestTimeoutMs || 30000);
		this.nextId = 1;
		this.pending = new Map();
		this.events = [];
		this.closed = false;
	}

	async connect() {
		if (!this.WebSocketClass) {
			throw new Error('CdpSession: WebSocket is unavailable.');
		}
		this.socket = new this.WebSocketClass(this.webSocketUrl);
		this.socket.addEventListener('message', event => this.receive(event.data));
		this.socket.addEventListener('close', () => this.failPending(
			new Error('CdpSession: Chrome DevTools socket closed.')
		));
		this.socket.addEventListener('error', () => this.failPending(
			new Error('CdpSession: Chrome DevTools socket failed.')
		));
		await this.openPromise();
		return this;
	}

	openPromise() {
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				reject(new Error('CdpSession: Chrome DevTools connection timed out.'));
			}, this.requestTimeoutMs);
			this.socket.addEventListener('open', () => {
				clearTimeout(timer);
				resolve();
			}, { once: true });
			this.socket.addEventListener('error', () => {
				clearTimeout(timer);
				reject(new Error('CdpSession: Chrome DevTools connection failed.'));
			}, { once: true });
		});
	}

	receive(rawMessage) {
		const message = JSON.parse(rawMessage);
		if (!message.id) {
			this.events.push(message);
			return;
		}
		const pending = this.pending.get(message.id);
		if (!pending) return;
		this.pending.delete(message.id);
		clearTimeout(pending.timer);
		if (message.error) pending.reject(new Error(message.error.message));
		else pending.resolve(message.result || {});
	}

	send(method, params = {}) {
		if (!this.socket || this.closed || !this.socketIsOpen()) {
			return Promise.reject(new Error(
				`CdpSession: Cannot send ${method}; socket is not open.`
			));
		}
		const id = this.nextId;
		this.nextId += 1;
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				this.pending.delete(id);
				reject(new Error(`CdpSession: ${method} timed out.`));
			}, this.requestTimeoutMs);
			this.pending.set(id, { method, reject, resolve, timer });
			try {
				this.socket.send(JSON.stringify({ id, method, params }));
			} catch (error) {
				clearTimeout(timer);
				this.pending.delete(id);
				reject(error);
			}
		});
	}

	async evaluate(expression) {
		const result = await this.send('Runtime.evaluate', {
			expression,
			awaitPromise: true,
			returnByValue: true
		});
		if (result.exceptionDetails) {
			throw new Error(result.exceptionDetails.text || 'Browser evaluation failed.');
		}
		return result.result?.value;
	}

	async wait(milliseconds) {
		await new Promise(resolve => setTimeout(resolve, milliseconds));
	}

	failPending(error) {
		this.closed = true;
		for (const pending of this.pending.values()) {
			clearTimeout(pending.timer);
			pending.reject(error);
		}
		this.pending.clear();
	}

	socketIsOpen() {
		const openState = this.WebSocketClass.OPEN ?? 1;
		return this.socket.readyState === openState;
	}

	close() {
		this.failPending(new Error('CdpSession: Session closed.'));
		this.socket?.close();
	}
}
