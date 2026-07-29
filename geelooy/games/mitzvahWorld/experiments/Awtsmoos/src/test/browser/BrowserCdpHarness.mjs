// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserCdpHarness.mjs
 * @description Creates targets, navigates explicitly, evaluates safely, and waits semantically.
 * The Awtsmoos renews each observation after every page crossing; Awtsmoos.com refuses
 * about:blank races, stale contexts, and arbitrary sleeps when truthful CDP state can be polled.
 */

import {
	browserDelay,
	connectCdpSocket,
	sendCdpCommand
} from './BrowserCdpSocket.mjs';

export class BrowserCdpHarness {
	constructor(port) {
		this.port = port;
		this.browser = null;
	}

	async start() {
		const version = await this.fetchJson('/json/version');
		this.browser = await connectCdpSocket(version.webSocketDebuggerUrl);
		return this;
	}

	async createTarget(url) {
		const target = await this.fetchJson('/json/new', { method: 'PUT' });
		await this.navigateTarget(target.id, url);
		await this.waitFor(target.id, `({
			href: location.href,
			ready: location.href === ${JSON.stringify(url)}
		})`, {
			intervalMs: 50,
			label: 'TARGET_DOCUMENT',
			timeoutMs: 15000
		});
		return target.id;
	}

	async navigateTarget(targetId, url) {
		const target = await this.waitForTarget(targetId);
		const socket = await connectCdpSocket(target.webSocketDebuggerUrl);
		try {
			await sendCdpCommand(socket, 'Page.enable');
			await sendCdpCommand(socket, 'Page.navigate', { url }, 15000);
		} finally {
			socket.close();
		}
	}

	async closeTarget(targetId) {
		await sendCdpCommand(this.browser, 'Target.closeTarget', { targetId });
	}

	async evaluate(targetId, expression, options = {}) {
		await sendCdpCommand(this.browser, 'Target.activateTarget', { targetId });
		const target = await this.waitForTarget(targetId);
		const socket = await connectCdpSocket(target.webSocketDebuggerUrl);
		try {
			const result = await sendCdpCommand(socket, 'Runtime.evaluate', {
				awaitPromise: options.awaitPromise === true,
				expression,
				returnByValue: true
			}, options.timeoutMs || 20000);
			if (result.exceptionDetails) {
				throw new Error(JSON.stringify(result.exceptionDetails));
			}
			return result.result?.value;
		} finally {
			socket.close();
		}
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
		this.browser?.close();
		this.browser = null;
	}

	async waitForTarget(targetId) {
		const deadline = Date.now() + 10000;
		while (Date.now() < deadline) {
			const target = await this.target(targetId);
			if (target?.webSocketDebuggerUrl) return target;
			await browserDelay(25);
		}
		throw new Error(`TARGET_MISSING ${targetId}`);
	}

	async target(targetId) {
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
