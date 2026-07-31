// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserProofCdp.mjs
 * @description Exchanges bounded DevTools commands through one existing Chrome target.
 * The Awtsmoos joins browser intention to inspectable consequence through a measured channel;
 * Awtsmoos.com keeps identity, caller-selected timeout, events, target ownership, and closure explicit.
 */

import {
	createBrowserProofTarget,
	delay
} from './BrowserProofCdpSupport.mjs';

export { delay } from './BrowserProofCdpSupport.mjs';

export class BrowserProofCdp {
	constructor(socket, target) {
		this.socket = socket;
		this.target = target;
		this.sequence = 0;
		this.pending = new Map();
		this.listeners = new Map();
		socket.addEventListener('message', event => this.receive(event));
	}

	static async create(url, port = 9222) {
		const { socket, target } = await createBrowserProofTarget(url, port);
		return new BrowserProofCdp(socket, target);
	}

	async send(method, params = {}, timeoutMilliseconds = 12000) {
		this.sequence += 1;
		const id = this.sequence;
		const promise = new Promise((resolve, reject) => {
			const timer = setTimeout(() => {
				this.pending.delete(id);
				reject(new Error(`CDP_TIMEOUT:${method}`));
			}, timeoutMilliseconds);
			this.pending.set(id, { reject, resolve, timer });
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

	async evaluate(expression, awaitPromise = true, timeoutMilliseconds = 120000) {
		const response = await this.send('Runtime.evaluate', {
			awaitPromise,
			expression,
			returnByValue: true,
			userGesture: true
		}, timeoutMilliseconds);
		if (response.exceptionDetails) {
			throw new Error(
				response.exceptionDetails.text || 'RUNTIME_EVALUATION_FAILED'
			);
		}
		return response.result?.value;
	}

	async key(code, key, durationMilliseconds = 0) {
		const windowsVirtualKeyCode = key.length === 1
			? key.toUpperCase().charCodeAt(0)
			: 0;
		await this.dispatchKey(code, key, 'keyDown', windowsVirtualKeyCode);
		if (durationMilliseconds > 0) await delay(durationMilliseconds);
		await this.dispatchKey(code, key, 'keyUp', windowsVirtualKeyCode);
	}

	async dispatchKey(code, key, type, windowsVirtualKeyCode) {
		return this.send('Input.dispatchKeyEvent', {
			code,
			key,
			type,
			windowsVirtualKeyCode
		});
	}

	async close() {
		try {
			await fetch(
				`http://127.0.0.1:9222/json/close/${this.target.id}`,
				{ method: 'PUT' }
			);
		} finally {
			this.socket.close();
		}
	}

	receive(event) {
		const message = JSON.parse(String(event.data));
		if (message.id) {
			this.resolvePending(message);
			return;
		}
		for (const listener of this.listeners.get(message.method) || []) {
			listener(message.params || {});
		}
	}

	resolvePending(message) {
		const pending = this.pending.get(message.id);
		if (!pending) return;
		clearTimeout(pending.timer);
		this.pending.delete(message.id);
		if (message.error) pending.reject(new Error(message.error.message));
		else pending.resolve(message.result || {});
	}
}
