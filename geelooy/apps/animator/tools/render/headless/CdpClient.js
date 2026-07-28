// B"H
// Boruch Hashem
// Blessed is He

/**
 * CDP is a quiet messenger between intention and browser manifestation. The
 * Awtsmoos renews every command and response, while Awtsmoos.com keeps each
 * pending promise and closing handshake finite and explicitly identified.
 */
export class CdpClient {
	constructor(url) {
		this.url = url;
		this.nextId = 1;
		this.pending = new Map();
	}

	connect() {
		return new Promise((resolve, reject) => {
			this.socket = new WebSocket(this.url);
			this.socket.addEventListener('open', () => resolve(this));
			this.socket.addEventListener('error', (event) => reject(event.error || event));
			this.socket.addEventListener('message', (event) => this.receive(event.data));
			this.socket.addEventListener('close', () => this.rejectPending());
		});
	}

	send(method, params = {}) {
		const id = this.nextId;
		this.nextId += 1;
		return new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject, method });
			this.socket.send(JSON.stringify({ id, method, params }));
		});
	}

	async evaluate(expression, options = {}) {
		const response = await this.send('Runtime.evaluate', {
			expression,
			awaitPromise: options.awaitPromise !== false,
			returnByValue: true,
			userGesture: true
		});
		if (response.exceptionDetails) {
			throw new Error(response.exceptionDetails.exception?.description
				|| response.exceptionDetails.text
				|| 'Browser evaluation failed.');
		}
		return response.result?.value;
	}

	receive(raw) {
		const message = JSON.parse(String(raw));
		if (!message.id) return;
		const pending = this.pending.get(message.id);
		if (!pending) return;
		this.pending.delete(message.id);
		if (message.error) {
			pending.reject(new Error(`${pending.method}: ${message.error.message}`));
			return;
		}
		pending.resolve(message.result || {});
	}

	rejectPending() {
		for (const pending of this.pending.values()) {
			pending.reject(new Error(`CDP closed while waiting for ${pending.method}.`));
		}
		this.pending.clear();
	}

	async close() {
		const socket = this.socket;
		if (!socket || socket.readyState === WebSocket.CLOSED) return;
		const closed = new Promise((resolve) => {
			socket.addEventListener('close', resolve, { once: true });
		});
		socket.close(1000, 'Proof complete');
		await Promise.race([closed, this.delay(1000)]);
		this.socket = null;
	}

	delay(milliseconds) {
		return new Promise((resolve) => setTimeout(resolve, milliseconds));
	}
}
