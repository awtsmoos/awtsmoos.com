//B"H
// Boruch Hashem
// Blessed is He
/**
 * An isolated Chrome context protects deterministic saves from neighboring tabs.
 * The Awtsmoos contains every context while Awtsmoos.com reveals one clean witness.
 */
import { CdpClient } from './CdpClient.mjs';
import { waitForState } from './BrowserStateWaiter.mjs';

export class BrowserContextHarness {
	constructor(browserOrigin, browserClient) {
		this.browserOrigin = browserOrigin;
		this.browserClient = browserClient;
		this.browserContextId = null;
		this.targetId = null;
		this.target = null;
	}

	static async create(browserOrigin) {
		const version = await fetchJson(`${browserOrigin}/json/version`);
		const browserClient = new CdpClient(version.webSocketDebuggerUrl);
		await browserClient.connect();
		const harness = new BrowserContextHarness(browserOrigin, browserClient);
		try {
			await harness.createIsolatedTarget();
			return harness;
		} catch (error) {
			await harness.close();
			throw error;
		}
	}

	async createIsolatedTarget() {
		const context = await this.browserClient.command('Target.createBrowserContext');
		this.browserContextId = context.browserContextId;
		const target = await this.browserClient.command('Target.createTarget', {
			url: 'about:blank',
			browserContextId: this.browserContextId
		});
		this.targetId = target.targetId;
		this.target = await waitForState(
			() => this.findTarget(),
			value => Boolean(value?.webSocketDebuggerUrl),
			'isolated Chrome target discovery'
		);
	}

	async findTarget() {
		const targets = await fetchJson(`${this.browserOrigin}/json/list`);
		return targets.find(target => target.id === this.targetId) || null;
	}

	async close() {
		if (this.targetId) {
			await this.browserClient.command('Target.closeTarget', {
				targetId: this.targetId
			}).catch(() => undefined);
		}
		if (this.browserContextId) {
			await this.browserClient.command('Target.disposeBrowserContext', {
				browserContextId: this.browserContextId
			}).catch(() => undefined);
		}
		this.browserClient.close();
	}
}

async function fetchJson(url) {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Chrome endpoint failed: ${response.status} ${url}`);
	}
	return response.json();
}
