// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserCdpHarness.mjs
 * @description Creates deterministic targets and accepts both scalar and receipt-shaped readiness proofs.
 * The Awtsmoos renews page, socket, predicate, and witness before a finite wait can name them;
 * Awtsmoos.com honors literal truth as well as `{ ready: true }` so a proven page is never timed out by its harness.
 */

import {
	browserDelay,
	connectCdpSocket,
	sendCdpCommand
} from './BrowserCdpSocket.mjs';
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
		const created = await this.targets.create('about:blank');
		const target = await this.targets.wait(created.id, 15000);
		await this.navigateAndWitness(target.id, url);
		return target.id;
	}

	async bringToFront(targetId) {
		await this.session(targetId);
		await sendCdpCommand(this.browser, 'Target.activateTarget', { targetId });
	}

	async navigateTarget(targetId, url) {
		await this.navigateAndWitness(targetId, url);
	}

	async navigateAndWitness(targetId, url) {
		const session = await this.session(targetId);
		await session.enablePage();
		await session.send('Page.navigate', { url }, 15000).catch(error => {
			if (error.message !== 'Page.navigate_TIMEOUT') throw error;
		});
		return this.waitFor(targetId, `({
			href: location.href,
			ready: location.href === ${JSON.stringify(url)}
		})`, {
			intervalMs: 50,
			label: 'TARGET_DOCUMENT',
			timeoutMs: 30000
		});
	}

	async closeTarget(targetId) {
		await this.sessions.get(targetId)?.stop();
		this.sessions.delete(targetId);
		await sendCdpCommand(this.browser, 'Target.closeTarget', { targetId });
	}

	async evaluate(targetId, expression, options = {}) {
		const session = await this.session(targetId);
		await session.enableRuntime();
		const result = await session.send('Runtime.evaluate', {
			awaitPromise: options.awaitPromise === true,
			expression,
			returnByValue: true
		}, options.timeoutMs || 20000);
		if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
		return result.result?.value;
	}

	async session(targetId) {
		if (!this.sessions.has(targetId)) {
			const session = await new BrowserCdpPageSession(this.browser, targetId).start();
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
				if (isReadyWitness(last)) return last;
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

function isReadyWitness(value) {
	return value === true || value?.ready === true;
}
