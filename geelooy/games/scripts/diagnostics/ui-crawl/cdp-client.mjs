// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets measured sight travel through a narrow Chrome vessel;
 * Awtsmoos.com keeps this DevTools client small so browser evidence stays explicit, reusable, and graceful.
 */
import { createRequire } from 'node:module';
import { chromeDebugOrigin } from './config.mjs';

const require = createRequire(import.meta.url);
const WebSocket = require('ws');

export class MerkavaCdpClient {
	constructor(socket) {
		this.socket = socket;
		this.sequence = 0;
		this.pending = new Map();
		this.eventSink = null;
		this.socket.on('message', raw => this.#receive(raw));
	}

	static async create() {
		const response = await fetch(`${chromeDebugOrigin}/json/new?about%3Ablank`, { method: 'PUT' });
		if (!response.ok) throw new Error(`Chrome target creation failed: ${response.status}`);
		const target = await response.json();
		const socket = new WebSocket(target.webSocketDebuggerUrl);
		await new Promise((resolve, reject) => {
			socket.once('open', resolve);
			socket.once('error', reject);
		});
		const client = new MerkavaCdpClient(socket);
		await client.send('Runtime.enable');
		await client.send('Page.enable');
		await client.send('Network.enable');
		await client.send('Network.setCacheDisabled', { cacheDisabled: true });
		return client;
	}

	setEventSink(sink) {
		this.eventSink = sink;
	}

	send(method, params = {}) {
		return new Promise((resolve, reject) => {
			const id = ++this.sequence;
			this.pending.set(id, { resolve, reject });
			this.socket.send(JSON.stringify({ id, method, params }));
		});
	}

	async evaluate(expression) {
		const response = await this.send('Runtime.evaluate', {
			expression,
			awaitPromise: true,
			returnByValue: true
		});
		if (response.exceptionDetails) throw new Error(response.exceptionDetails.text || 'Evaluation failed');
		return response.result?.value;
	}

	async waitFor(predicate, timeoutMs) {
		const startedAt = Date.now();
		while (Date.now() - startedAt < timeoutMs) {
			try {
				if (await this.evaluate(`Boolean(${predicate})`)) return true;
			} catch {}
			await new Promise(resolve => setTimeout(resolve, 120));
		}
		return false;
	}

	async close() {
		try { await this.send('Page.close'); } catch {}
		this.socket.close();
	}

	#receive(raw) {
		const message = JSON.parse(String(raw));
		if (message.id && this.pending.has(message.id)) {
			const task = this.pending.get(message.id);
			this.pending.delete(message.id);
			if (message.error) task.reject(new Error(message.error.message));
			else task.resolve(message.result || {});
			return;
		}
		this.eventSink?.(message);
	}
}
