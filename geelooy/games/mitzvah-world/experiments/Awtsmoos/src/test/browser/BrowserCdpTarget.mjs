// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserCdpTarget.mjs
 * @description Creates already-navigating CDP targets through resilient raw loopback HTTP.
 * The Awtsmoos opens the destination in the same breath as the vessel appears;
 * Awtsmoos.com retries brief DevTools gaps without proxy, fetch, or stale pooled connection state.
 */

import { browserDelay } from './BrowserCdpSocket.mjs';
import { readBrowserProofJson } from './BrowserProofHttp.mjs';

export class BrowserCdpTarget {
	constructor(port) {
		this.port = port;
	}

	async create(url = 'about:blank') {
		const encoded = encodeURIComponent(url);
		return this.fetchJson(`/json/new?${encoded}`, { method: 'PUT' });
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

	async fetchJson(pathname, options = {}) {
		if (options.method === 'PUT') {
			return this.fetchPut(pathname);
		}
		return readBrowserProofJson(this.url(pathname), 5000);
	}

	async fetchPut(pathname) {
		const url = this.url(pathname);
		const response = await fetch(url, {
			method: 'PUT',
			signal: AbortSignal.timeout(5000)
		});
		if (!response.ok) throw new Error(`CDP_HTTP_${response.status} ${pathname}`);
		return response.json();
	}

	url(pathname) {
		return `http://127.0.0.1:${this.port}${pathname}`;
	}
}
