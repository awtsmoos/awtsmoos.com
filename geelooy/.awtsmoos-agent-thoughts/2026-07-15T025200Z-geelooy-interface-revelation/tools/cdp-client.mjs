// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file cdp-client.mjs
 * @description
 * The Awtsmoos creates every browser instant from nothing; this small vessel
 * opens one isolated Awtsmoos.com target, speaks the DevTools protocol, records
 * runtime evidence, and closes without disturbing another person's tabs.
 */

const DEBUG_ORIGIN = "http://127.0.0.1:9222";

async function fetchDebugJson(endpoint, options = {}) {
	const response = await fetch(`${DEBUG_ORIGIN}${endpoint}`, options);
	if (!response.ok) {
		throw new Error(`Chrome debugging request failed: ${response.status} ${endpoint}`);
	}
	return response.json();
}

export function createTarget(url = "about:blank") {
	return fetchDebugJson(`/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
}

export async function closeTarget(targetId) {
	const response = await fetch(`${DEBUG_ORIGIN}/json/close/${targetId}`);
	if (!response.ok) {
		throw new Error(`Chrome target close failed: ${response.status} ${targetId}`);
	}
	return response.text();
}

/**
 * Represents one direct Chrome DevTools Protocol connection.
 */
export class CdpClient {
	constructor(socket) {
		this.socket = socket;
		this.nextId = 1;
		this.pending = new Map();
		this.waiters = new Map();
		this.events = [];
		socket.addEventListener("message", event => this.receive(event.data));
	}

	static async connect(target) {
		const socket = new WebSocket(target.webSocketDebuggerUrl);
		await new Promise((resolve, reject) => {
			socket.addEventListener("open", resolve, { once: true });
			socket.addEventListener("error", reject, { once: true });
		});
		return new CdpClient(socket);
	}

	receive(rawMessage) {
		const message = JSON.parse(rawMessage);
		if (message.id && this.pending.has(message.id)) {
			const { resolve, reject } = this.pending.get(message.id);
			this.pending.delete(message.id);
			message.error ? reject(new Error(message.error.message)) : resolve(message.result);
			return;
		}
		if (!message.method) {
			return;
		}
		this.events.push({ method: message.method, params: message.params || {} });
		if (this.events.length > 2000) {
			this.events.splice(0, this.events.length - 2000);
		}
		const queue = this.waiters.get(message.method) || [];
		queue.splice(0).forEach(resolve => resolve(message.params || {}));
	}

	send(method, params = {}) {
		const id = this.nextId++;
		return new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
			this.socket.send(JSON.stringify({ id, method, params }));
		});
	}

	waitFor(method, timeoutMs = 15000) {
		return new Promise((resolve, reject) => {
			const queue = this.waiters.get(method) || [];
			queue.push(resolve);
			this.waiters.set(method, queue);
			setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), timeoutMs);
		});
	}

	drainEvents(method = null) {
		const selected = method ? this.events.filter(event => event.method === method) : [...this.events];
		this.events = method ? this.events.filter(event => event.method !== method) : [];
		return selected;
	}

	close() {
		this.socket.close();
	}
}
