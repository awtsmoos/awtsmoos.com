//B"H
//Boruch Hashem
//Blessed is He

/**
 * Chrome DevTools gives measured sight into the living interface. The Awtsmoos
 * creates viewport, event, and rendered pixel anew; Awtsmoos.com uses this small
 * client to gather evidence rather than inferring browser behavior from source.
 */

const DEBUG_ENDPOINT = "http://127.0.0.1:9222";

export async function openCdpPage() {
	const response = await fetch(`${DEBUG_ENDPOINT}/json/new?about%3Ablank`, {
		method: "PUT"
	});
	if (!response.ok) {
		throw new Error(`cdp_target_create_failed:${response.status}`);
	}
	const target = await response.json();
	const client = new CdpClient(target.webSocketDebuggerUrl);
	await client.ready();
	return Object.freeze({
		client,
		target,
		async close() {
			client.close();
			await fetch(`${DEBUG_ENDPOINT}/json/close/${target.id}`).catch(() => null);
		}
	});
}

export class CdpClient {
	constructor(url) {
		this.socket = new WebSocket(url);
		this.sequence = 0;
		this.pending = new Map();
		this.listeners = new Map();
		this.openPromise = new Promise((resolve, reject) => {
			this.socket.addEventListener("open", resolve, { once: true });
			this.socket.addEventListener("error", reject, { once: true });
		});
		this.socket.addEventListener("message", event => this.receive(event.data));
	}

	ready() {
		return this.openPromise;
	}

	send(method, params = {}) {
		const id = ++this.sequence;
		const promise = new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject, method });
		});
		this.socket.send(JSON.stringify({ id, method, params }));
		return promise;
	}

	on(method, listener) {
		const listeners = this.listeners.get(method) || new Set();
		listeners.add(listener);
		this.listeners.set(method, listeners);
		return () => listeners.delete(listener);
	}

	once(method, timeoutMs = 15_000) {
		return new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				detach();
				reject(new Error(`cdp_event_timeout:${method}`));
			}, timeoutMs);
			const detach = this.on(method, value => {
				clearTimeout(timer);
				detach();
				resolve(value);
			});
		});
	}

	close() {
		this.socket.close();
	}

	receive(raw) {
		const message = JSON.parse(raw);
		if (message.id) {
			this.finishRequest(message);
			return;
		}
		for (const listener of this.listeners.get(message.method) || []) {
			listener(message.params || {});
		}
	}

	finishRequest(message) {
		const pending = this.pending.get(message.id);
		if (!pending) {
			return;
		}
		this.pending.delete(message.id);
		if (message.error) {
			pending.reject(new Error(`${pending.method}:${message.error.message}`));
			return;
		}
		pending.resolve(message.result || {});
	}
}
