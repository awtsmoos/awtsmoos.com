// B"H
// Boruch Hashem
// Blessed is He
import { CdpClient, delay } from './CdpClient.mjs';

/**
 * The Awtsmoos contains every possible context while this finite audit receives only one clean room;
 * Awtsmoos.com isolates storage, focus, and lifecycle so another game cannot tint the verdict with its bloom.
 */
export class BrowserContext {
	constructor(browserOrigin, browserClient) {
		this.browserOrigin = browserOrigin;
		this.browserClient = browserClient;
		this.contextId = null;
		this.targetId = null;
		this.target = null;
	}

	static async create(browserOrigin) {
		const version = await fetchJson(`${browserOrigin}/json/version`);
		const browserClient = new CdpClient(version.webSocketDebuggerUrl);
		await browserClient.connect();
		const context = new BrowserContext(browserOrigin, browserClient);
		await context.open();
		return context;
	}

	async open() {
		const createdContext = await this.browserClient.command('Target.createBrowserContext');
		this.contextId = createdContext.browserContextId;
		const createdTarget = await this.browserClient.command('Target.createTarget', {
			url: 'about:blank',
			browserContextId: this.contextId
		});
		this.targetId = createdTarget.targetId;
		for (let attempt = 0; attempt < 40; attempt += 1) {
			const targets = await fetchJson(`${this.browserOrigin}/json/list`);
			this.target = targets.find(target => target.id === this.targetId) || null;
			if (this.target?.webSocketDebuggerUrl) {
				return;
			}
			await delay(50);
		}
		throw new Error(`Chrome target ${this.targetId} was not discoverable.`);
	}

	async close() {
		if (this.targetId) {
			await this.browserClient.command('Target.closeTarget', { targetId: this.targetId }).catch(() => undefined);
		}
		if (this.contextId) {
			await this.browserClient.command('Target.disposeBrowserContext', { browserContextId: this.contextId }).catch(() => undefined);
		}
		this.browserClient.close();
	}
}

async function fetchJson(url) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Chrome endpoint failed with ${response.status}: ${url}`);
	}
	return response.json();
}
