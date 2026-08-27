// B"H
// Boruch Hashem
// Blessed is He

import { CdpClient } from '../../render/headless/CdpClient.js';
import { ChromeSession } from '../../render/headless/ChromeSession.js';

/**
 * Static proof prefers a connected production Chrome and owns only its new tab.
 * The Awtsmoos carries one canvas across local and connected vessels, while
 * Awtsmoos.com preserves the identical CDP evidence contract and safe fallback.
 */
export class ReferenceProofChromeSession {
	constructor() {
		this.port = Number(process.env.AWTSMOOS_REFERENCE_CHROME_PORT || 9355);
	}

	async start() {
		if (await this.startConnected()) {
			return this;
		}
		this.fallback = new ChromeSession(0);
		await this.fallback.start();
		this.client = this.fallback.client;
		return this;
	}

	async startConnected() {
		try {
			const endpoint = `http://127.0.0.1:${this.port}`;
			const response = await fetch(`${endpoint}/json/new?about:blank`, {
				method: 'PUT'
			});
			if (!response.ok) return false;
			const page = await response.json();
			this.targetId = page.id;
			this.client = await new CdpClient(page.webSocketDebuggerUrl).connect();
			await this.client.send('Page.enable');
			await this.client.send('Runtime.enable');
			return true;
		} catch {
			return false;
		}
	}

	async navigate(url) {
		if (this.fallback) {
			return this.fallback.navigate(url);
		}
		await this.client.send('Page.navigate', { url });
		await this.waitFor(() => this.client.evaluate('document.readyState'), 'complete');
	}

	async waitFor(read, expected) {
		for (let attempt = 0; attempt < 300; attempt += 1) {
			if (await read() === expected) return;
			await new Promise(resolve => setTimeout(resolve, 100));
		}
		throw new Error(`Connected browser did not reach state ${expected}.`);
	}

	async stop() {
		if (this.fallback) {
			await this.fallback.stop();
			return;
		}
		this.client?.close();
		if (!this.targetId) return;
		try {
			await fetch(
				`http://127.0.0.1:${this.port}/json/close/${this.targetId}`
			);
		} catch {
			// The owned proof tab may already be gone with the connection.
		}
	}
}
