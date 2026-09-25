//B"H
// Boruch Hashem
// Blessed is He
import WebSocket from 'ws';
import { withTimeout } from './timeouts.mjs';

/** A bounded CDP vessel: every message either resolves, rejects, or times out. */
export class DevtoolsClient {
	constructor(socket, timeoutMs) {
		this.socket = socket;
		this.timeoutMs = timeoutMs;
		this.sequence = 0;
		this.pending = new Map();
		this.listeners = new Set();
		socket.on('message', raw => this.#receive(raw));
		socket.on('close', () => this.#failPending(new Error('AUDIT_CDP socket closed')));
		socket.on('error', error => this.#failPending(error));
	}

	static async connect(url, timeoutMs) {
		const socket = new WebSocket(url);
		await withTimeout(new Promise((resolve, reject) => {
			socket.once('open', resolve);
			socket.once('error', reject);
		}), timeoutMs, `CDP connect ${url}`);
		return new DevtoolsClient(socket, timeoutMs);
	}

	onEvent(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	send(method, params = {}) {
		const id = ++this.sequence;
		const operation = new Promise((resolve, reject) => {
			this.pending.set(id, { resolve, reject });
			this.socket.send(JSON.stringify({ id, method, params }), error => {
				if (error) this.#settle(id, 'reject', error);
			});
		});
		return withTimeout(operation, this.timeoutMs, `CDP ${method}`).finally(() => this.pending.delete(id));
	}

	close() {
		if (this.socket.readyState < WebSocket.CLOSING) this.socket.close();
	}

	#receive(raw) {
		const message = JSON.parse(raw.toString());
		if (message.id && this.pending.has(message.id)) {
			return this.#settle(message.id, message.error ? 'reject' : 'resolve', message.error || message.result || {});
		}
		for (const listener of this.listeners) listener(message);
	}

	#settle(id, mode, value) {
		const pending = this.pending.get(id);
		if (!pending) return;
		this.pending.delete(id);
		pending[mode](value);
	}

	#failPending(error) {
		for (const [id] of this.pending) this.#settle(id, 'reject', error);
	}
}
