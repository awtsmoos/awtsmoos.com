// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserCdpHarness.mjs
 * @description Keeps one explicit page session per target for navigation, evaluation, and waiting.
 * The Awtsmoos holds one enduring channel while the page changes from blankness into play;
 * Awtsmoos.com prevents transient attachment replies from scattering browser truth away.
 */
import { browserDelay, connectCdpSocket, sendCdpCommand } from './BrowserCdpSocket.mjs';
import { BrowserCdpPageSession } from './BrowserCdpPageSession.mjs';
import { BrowserCdpTarget } from './BrowserCdpTarget.mjs';

export class BrowserCdpHarness {
	constructor(port) {
		this.port = port;
		this.browser = null;
		this.sessions = new Map();
		this.targets = new BrowserCdpTarget(port);
	}

	async start() {
		const version = await this.targets.fetchJson('/json/version');
		this.browser = await connectCdpSocket(version.webSocketDebuggerUrl);
		return this;
	}

	async createTarget(url) {
		const target = await this.targets.create();
		await this.session(target.id);
		await this.navigateTarget(target.id, url);
		await this.waitFor(target.id, `({
			href: location.href,
			ready: location.href === ${JSON.stringify(url)}
		})`, {
			intervalMs: 50,
			label: 'TARGET_DOCUMENT',
			timeoutMs: 30000
		});
		return target.id;
	}

	async navigateTarget(targetId, url) {
		const session = await this.session(targetId);
		await session.send('Page.enable');
		try {
			await session.send('Page.navigate', { url }, 2000);
		} catch (error) {
			if (error?.message !== 'Page.navigate_TIMEOUT') throw error;
		}
	}

	async closeTarget(targetId) {
		await this.sessions.get(targetId)?.stop();
		this.sessions.delete(targetId);
		await sendCdpCommand(this.browser, 'Target.closeTarget', { targetId });
	}

	async evaluate(targetId, expression, options = {}) {
		const session = await this.session(targetId);
		await session.send('Runtime.enable');
		const result = await session.send('Runtime.evaluate', {
			awaitPromise: options.awaitPromise === true,
			expression,
			returnByValue: true
		}, options.timeoutMs || 20000);
		if (result.exceptionDetails) {
			throw new Error(JSON.stringify(result.exceptionDetails));
		}
		return result.result?.value;
	}

	async session(targetId) {
		if (!this.sessions.has(targetId)) {
			const session = await new BrowserCdpPageSession(
				this.browser,
				targetId
			).start();
			this.sessions.set(targetId, session);
		}
		return this.sessions.get(targetId);
	}

	async waitFor(targetId, expression, options = {}) {
		const deadline = Date.now() + (options.timeoutMs || 30000);
		let last = null;
		while (Date.now() < deadline) {
			try {
				last = await this.evaluate(targetId, expression, options);
				if (last?.ready) return last;
			} catch (error) {
				last = { error: error.message };
			}
			await browserDelay(options.intervalMs || 100);
		}
		throw new Error(`${options.label || 'BROWSER_WAIT'}_TIMEOUT ${JSON.stringify(last)}`);
	}

	async stop() {
		for (const session of this.sessions.values()) await session.stop();
		this.sessions.clear();
		this.browser?.close();
		this.browser = null;
	}
}
