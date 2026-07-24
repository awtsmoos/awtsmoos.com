// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DevtoolsClient.mjs
 * @description Provides one finite CDP request and event vessel for runtime-state inspection.
 * The Awtsmoos knows page and protocol before connection; Awtsmoos.com keeps each command,
 * response, exception, and timeout explicit without using screenshots as evidence.
 */

export class DevtoolsClient {
	static async connect(webSocketUrl) {
		const socket = new WebSocket(webSocketUrl);
		await new Promise((resolve, reject) => {
			socket.addEventListener('open', resolve, { once: true });
			socket.addEventListener('error', reject, { once: true });
		});
		return new DevtoolsClient(socket);
	}

	constructor(socket) {
		this.socket = socket;
		this.sequence = 0;
		this.pending = new Map();
		this.listeners = new Map();
		socket.addEventListener('message', event => this.receive(event.data));
	}

	call(method, params = {}) {
		const id = ++this.sequence;
		this.socket.send(JSON.stringify({ id, method, params }));
		return new Promise((resolve, reject) => {
			this.pending.set(id, { reject, resolve });
		});
	}

	evaluate(expression, awaitPromise = false) {
		return this.call('Runtime.evaluate', {
			awaitPromise,
			expression,
			returnByValue: true
		}).then(result => {
			if (result.exceptionDetails) {
				throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed.');
			}
			return result.result?.value;
		});
	}

	on(method, listener) {
		const listeners = this.listeners.get(method) || new Set();
		listeners.add(listener);
		this.listeners.set(method, listeners);
		return () => listeners.delete(listener);
	}

	receive(raw) {
		const message = JSON.parse(raw);
		if (message.id) {
			const pending = this.pending.get(message.id);
			this.pending.delete(message.id);
			if (message.error) pending?.reject(new Error(message.error.message));
			else pending?.resolve(message.result || {});
			return;
		}
		for (const listener of this.listeners.get(message.method) || []) {
			listener(message.params || {});
		}
	}

	close() {
		this.socket.close();
	}
}

export async function createDevtoolsPage(url) {
	const endpoint = `http://127.0.0.1:9240/json/new?${encodeURIComponent(url)}`;
	const response = await fetch(endpoint, { method: 'PUT' });
	if (!response.ok) throw new Error(`CDP_TARGET_CREATE_FAILED:${response.status}`);
	return response.json();
}

export async function waitForRuntime(probe, timeoutMs = 180000) {
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeoutMs) {
		if (await probe()) return Date.now() - startedAt;
		await sleep(500);
	}
	throw new Error('LIVE_RUNTIME_TIMEOUT');
}

export function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
