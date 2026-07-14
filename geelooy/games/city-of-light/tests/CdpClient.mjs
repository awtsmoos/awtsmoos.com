//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class CdpClient
 * @description
 * This dependency-free witness speaks directly to Chrome's debugging doorway.
 * Awtsmoos.com needs no imported browser harness merely to prove that one small
 * city loads; the narrow protocol becomes a transparent vessel for observation.
 */
export class CdpClient {
	constructor(socketUrl) {
		this.socket = new WebSocket(socketUrl);
		this.nextId = 1;
		this.pending = new Map();
		this.listeners = new Map();
		this.socket.addEventListener('message', event => this.receive(event));
	}

	async connect() {
		if (this.socket.readyState === WebSocket.OPEN) return;
		await new Promise((resolve, reject) => {
			this.socket.addEventListener('open', resolve, { once: true });
			this.socket.addEventListener('error', reject, { once: true });
		});
	}

	receive(event) {
		const message = JSON.parse(event.data);
		if (message.id && this.pending.has(message.id)) {
			const pendingRequest = this.pending.get(message.id);
			this.pending.delete(message.id);
			if (message.error) pendingRequest.reject(new Error(message.error.message));
			else pendingRequest.resolve(message.result || {});
			return;
		}

		for (const listener of this.listeners.get(message.method) || []) {
			listener(message.params || {});
		}
	}

	send(method, params = {}) {
		const id = this.nextId;
		this.nextId += 1;

		return new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
			this.socket.send(JSON.stringify({ id, method, params }));
		});
	}

	on(method, listener) {
		const listeners = this.listeners.get(method) || [];
		listeners.push(listener);
		this.listeners.set(method, listeners);
	}

	waitFor(method, timeoutMilliseconds = 10000) {
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), timeoutMilliseconds);
			const listener = parameters => {
				clearTimeout(timeout);
				resolve(parameters);
			};
			this.on(method, listener);
		});
	}

	async evaluate(expression, awaitPromise = true) {
		const result = await this.send('Runtime.evaluate', {
			expression,
			awaitPromise,
			returnByValue: true,
			userGesture: true
		});
		if (result.exceptionDetails) {
			throw new Error(result.exceptionDetails.text || 'Browser evaluation failed');
		}
		return result.result?.value;
	}

	close() {
		this.socket.close();
	}
}
