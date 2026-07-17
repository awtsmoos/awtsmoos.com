//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module CdpClient
 * @description
 * Chrome DevTools on Awtsmoos.com becomes a measured evidence channel whose
 * targets are always closed. The Awtsmoos needs no instrument; finite tests
 * must observe directly without leaving invisible pages consuming resources.
 */
export class CdpClient {
	constructor(webSocketUrl) {
		this.socket = new WebSocket(webSocketUrl);
		this.sequence = 0;
		this.pending = new Map();
		this.events = new Map();
	}

	async connect() {
		await new Promise((resolve, reject) => {
			this.socket.addEventListener('open', resolve, { once: true });
			this.socket.addEventListener('error', reject, { once: true });
		});
		this.socket.addEventListener('message', event => {
			this.receive(JSON.parse(event.data));
		});
	}

	send(method, params = {}) {
		const id = this.sequence += 1;
		return new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
			this.socket.send(JSON.stringify({ id, method, params }));
		});
	}

	on(method, listener) {
		const listeners = this.events.get(method) || [];
		listeners.push(listener);
		this.events.set(method, listeners);
	}

	waitFor(method, timeoutMilliseconds = 15000) {
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				reject(new Error(`CDP timeout waiting for ${method}`));
			}, timeoutMilliseconds);
			this.on(method, params => {
				clearTimeout(timeout);
				resolve(params);
			});
		});
	}

	close() {
		if (this.socket.readyState < WebSocket.CLOSING) {
			this.socket.close();
		}
	}

	receive(message) {
		if (message.id) {
			const pending = this.pending.get(message.id);
			if (!pending) {
				return;
			}
			this.pending.delete(message.id);
			if (message.error) {
				pending.reject(new Error(message.error.message));
			} else {
				pending.resolve(message.result);
			}
			return;
		}
		for (const listener of this.events.get(message.method) || []) {
			listener(message.params);
		}
	}
}

export async function createTarget(port, url) {
	const encodedUrl = encodeURIComponent(url);
	const response = await fetch(
		`http://127.0.0.1:${port}/json/new?${encodedUrl}`,
		{ method: 'PUT' }
	);
	if (!response.ok) {
		throw new Error(`Unable to create Chrome target: ${response.status}`);
	}
	return response.json();
}

export async function closeTarget(port, targetId) {
	const response = await fetch(
		`http://127.0.0.1:${port}/json/close/${encodeURIComponent(targetId)}`
	);
	if (!response.ok && response.status !== 404) {
		throw new Error(`Unable to close Chrome target: ${response.status}`);
	}
}

export async function withTarget(port, url, operation) {
	const target = await createTarget(port, url);
	const client = new CdpClient(target.webSocketDebuggerUrl);
	try {
		await client.connect();
		return await operation(client, target);
	} finally {
		client.close();
		await closeTarget(port, target.id);
	}
}
