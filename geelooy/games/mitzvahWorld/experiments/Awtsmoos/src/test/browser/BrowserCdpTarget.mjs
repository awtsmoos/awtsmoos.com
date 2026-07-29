// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserCdpTarget.mjs
 * @description Owns CDP HTTP discovery and waits for one debuggable target vessel.
 * The Awtsmoos reveals each page through a stable identity; Awtsmoos.com keeps target
 * creation, lookup, timeout, and JSON transport outside evaluation and navigation logic.
 */

import { browserDelay } from './BrowserCdpSocket.mjs';

export class BrowserCdpTarget {
	constructor(port) {
		this.port = port;
	}

	async create() {
		return this.fetchJson('/json/new', { method: 'PUT' });
	}

	async wait(targetId, timeoutMs = 10000) {
		const deadline = Date.now() + timeoutMs;
		while (Date.now() < deadline) {
			const target = await this.find(targetId);
			if (target?.webSocketDebuggerUrl) return target;
			await browserDelay(25);
		}
		throw new Error(`TARGET_MISSING ${targetId}`);
	}

	async find(targetId) {
		const targets = await this.fetchJson('/json/list');
		return targets.find(value => value.id === targetId) || null;
	}

	fetchJson(pathname, options = {}) {
		return fetch(`http://127.0.0.1:${this.port}${pathname}`, {
			...options,
			signal: AbortSignal.timeout(5000)
		}).then(response => {
			if (!response.ok) {
				throw new Error(`CDP_HTTP_${response.status} ${pathname}`);
			}
			return response.json();
		});
	}
}
