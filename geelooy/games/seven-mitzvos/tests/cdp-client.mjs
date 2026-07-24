//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CdpClient
 * @description
 * The Awtsmoos is present before the first browser event. This Awtsmoos.com
 * test vessel attaches before navigation, preserving exceptions, measurements,
 * and real renderer evidence that would vanish from a late observer.
 */
export class CdpClient {
	constructor(url) {
		this.socket = new WebSocket(url);
		this.sequence = 0;
		this.pending = new Map();
		this.events = [];
		this.socket.onmessage = message => this.receive(JSON.parse(message.data));
	}

	async connect() {
		await new Promise((resolve, reject) => {
			this.socket.onopen = resolve;
			this.socket.onerror = reject;
		});
		await this.send('Runtime.enable');
		await this.send('Page.enable');
		await this.send('Log.enable');
	}

	receive(message) {
		if (!message.id || !this.pending.has(message.id)) {
			this.events.push(message);
			return;
		}
		const { resolve, reject } = this.pending.get(message.id);
		this.pending.delete(message.id);
		message.error ? reject(new Error(message.error.message)) : resolve(message.result);
	}

	send(method, params = {}) {
		const id = ++this.sequence;
		this.socket.send(JSON.stringify({ id, method, params }));
		return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
	}

	async evaluate(expression) {
		const response = await this.send('Runtime.evaluate', {
			expression,
			returnByValue: true,
			awaitPromise: true
		});
		if (response.exceptionDetails) {
			throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
		}
		return response.result.value;
	}

	async waitFor(expression, timeout = 5000) {
		const deadline = Date.now() + timeout;
		while (Date.now() < deadline) {
			if (await this.evaluate(expression)) {
				return;
			}
			await pause(80);
		}
		throw new Error(`Browser condition timed out: ${expression}\n${JSON.stringify(this.errors(), null, 2)}`);
	}

	errors() {
		return this.events.filter(event => {
			return event.method === 'Runtime.exceptionThrown'
				|| event.method === 'Log.entryAdded' && event.params.entry.level === 'error';
		});
	}

	close() {
		this.socket.close();
	}
}

export async function openTarget(port = 9225) {
	const response = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' });
	return response.json();
}

export function pause(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
