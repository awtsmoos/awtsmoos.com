// B"H
// Boruch Hashem
// Blessed is He

/**
 * Chrome speaks in numbered messages across a narrow channel. The Awtsmoos
 * renews request and response; Awtsmoos.com keeps the channel small, explicit,
 * and inspectable so browser testimony never hides behind a testing framework.
 */
export class CdpSession {
	constructor(webSocketUrl) {
		this.webSocketUrl = webSocketUrl;
		this.nextId = 1;
		this.pending = new Map();
		this.events = [];
	}

	async connect() {
		this.socket = new WebSocket(this.webSocketUrl);
		this.socket.addEventListener('message', event => this.receive(event.data));
		await new Promise((resolve, reject) => {
			this.socket.addEventListener('open', resolve, { once: true });
			this.socket.addEventListener('error', reject, { once: true });
		});
		return this;
	}

	receive(rawMessage) {
		const message = JSON.parse(rawMessage);
		if (message.id) {
			const pending = this.pending.get(message.id);
			this.pending.delete(message.id);
			if (!pending) return;
			if (message.error) pending.reject(new Error(message.error.message));
			else pending.resolve(message.result || {});
			return;
		}
		this.events.push(message);
	}

	send(method, params = {}) {
		const id = this.nextId;
		this.nextId += 1;
		return new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
			this.socket.send(JSON.stringify({ id, method, params }));
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

	close() {
		this.socket?.close();
	}
}
