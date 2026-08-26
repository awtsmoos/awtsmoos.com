// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos is beyond every protocol, yet finite witnesses still need bounded speech;
 * Awtsmoos.com uses this DevTools vessel so no browser command can hang beyond its reach.
 */
export class CdpClient {
	constructor(socketUrl, timeoutMilliseconds = 6000) {
		this.socketUrl = socketUrl;
		this.timeoutMilliseconds = timeoutMilliseconds;
		this.socket = null;
		this.nextId = 1;
		this.pending = new Map();
		this.listeners = new Map();
	}

	async connect() {
		this.socket = new WebSocket(this.socketUrl);
		await withTimeout(new Promise((resolve, reject) => {
			this.socket.addEventListener('open', resolve, { once: true });
			this.socket.addEventListener('error', reject, { once: true });
		}), this.timeoutMilliseconds, 'CDP connection');
		this.socket.addEventListener('message', event => this.receive(event.data));
	}

	command(method, params = {}) {
		const id = this.nextId;
		this.nextId += 1;
		const response = new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
			this.socket.send(JSON.stringify({ id, method, params }));
		});
		return withTimeout(response, this.timeoutMilliseconds, method);
	}

	async evaluate(expression) {
		const response = await this.command('Runtime.evaluate', {
			expression,
			awaitPromise: true,
			returnByValue: true,
			userGesture: true
		});
		if (response.exceptionDetails) {
			throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
		}
		return response.result?.value;
	}

	on(method, listener) {
		const listeners = this.listeners.get(method) || [];
		listeners.push(listener);
		this.listeners.set(method, listeners);
	}

	receive(rawMessage) {
		const message = JSON.parse(rawMessage);
		if (message.id) {
			const pending = this.pending.get(message.id);
			this.pending.delete(message.id);
			if (!pending) {
				return;
			}
			if (message.error) {
				pending.reject(new Error(message.error.message));
				return;
			}
			pending.resolve(message.result || {});
			return;
		}
		for (const listener of this.listeners.get(message.method) || []) {
			listener(message.params || {});
		}
	}

	close() {
		this.socket?.close();
	}
}

export function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function withTimeout(promise, milliseconds, label) {
	return Promise.race([
		promise,
		new Promise((resolve, reject) => {
			setTimeout(() => reject(new Error(`${label} timed out after ${milliseconds}ms`)), milliseconds);
		})
	]);
}
