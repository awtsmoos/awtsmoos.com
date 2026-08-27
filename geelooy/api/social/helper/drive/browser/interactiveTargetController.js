//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Gives owned Chromium targets a narrow frame, navigation, storage, and input bridge.
 * @description The Awtsmoos lets the living page move without exposing the hidden key;
 * Awtsmoos.com speaks only chosen CDP verbs, so raw debugger power stays server-free.
 */

const { normalizeProxyUrl } = require('./proxyUrlPolicy.js');
const { normalizeInteractiveInput } = require('./interactiveInputPolicy.js');

class InteractiveTargetController {
	constructor(devtools) {
		this.devtools = devtools;
		this.clients = new Map();
	}

	async frame(targetId, quality = 72) {
		const client = await this.clientFor(targetId);
		const metrics = await client.send('Page.getLayoutMetrics');
		const viewport = metrics.cssVisualViewport || metrics.visualViewport || {};
		const screenshot = await client.send('Page.captureScreenshot', {
			captureBeyondViewport: false,
			format: 'jpeg',
			fromSurface: true,
			quality: clampQuality(quality)
		});
		return {
			data: screenshot.data,
			height: Math.max(1, Math.round(viewport.clientHeight || 720)),
			mimeType: 'image/jpeg',
			width: Math.max(1, Math.round(viewport.clientWidth || 1280))
		};
	}

	async navigate(targetId, value) {
		const url = normalizeProxyUrl(value).href;
		const client = await this.clientFor(targetId);
		await client.send('Page.navigate', { url });
		return url;
	}

	async history(targetId, direction) {
		const client = await this.clientFor(targetId);
		if (direction === 'reload') {
			await client.send('Page.reload', { ignoreCache: false });
			return true;
		}
		const history = await client.send('Page.getNavigationHistory');
		const offset = direction === 'back' ? -1 : direction === 'forward' ? 1 : 0;
		if (!offset) throw controllerError('INTERACTIVE_HISTORY_ACTION_INVALID', 400);
		const entry = history.entries?.[history.currentIndex + offset];
		if (!entry) return false;
		await client.send('Page.navigateToHistoryEntry', { entryId: entry.id });
		return true;
	}

	async input(targetId, value) {
		const client = await this.clientFor(targetId);
		const command = normalizeInteractiveInput(value);
		await client.send(command.method, command.params);
		return true;
	}

	async clearCookies(targetId) {
		const client = await this.clientFor(targetId);
		await client.send('Network.enable');
		await client.send('Network.clearBrowserCookies');
		return true;
	}

	async close(targetId) {
		this.dropClient(targetId);
		return this.devtools.closeTarget(targetId);
	}

	async closeAll() {
		for (const targetId of [...this.clients.keys()]) this.dropClient(targetId);
	}

	async clientFor(targetId) {
		if (this.clients.has(targetId)) return this.clients.get(targetId);
		const target = await this.devtools.target(targetId);
		if (!target.webSocketDebuggerUrl) throw controllerError('INTERACTIVE_TARGET_SOCKET_MISSING', 503);
		const { CdpClient } = await import('../../../../../ai/relay/direct/browser/CdpClient.mjs');
		const client = new CdpClient(target.webSocketDebuggerUrl);
		await client.connect();
		await client.send('Page.enable');
		this.clients.set(targetId, client);
		return client;
	}

	dropClient(targetId) {
		const client = this.clients.get(targetId);
		this.clients.delete(targetId);
		try {
			client?.close();
		} catch {}
	}
}

function clampQuality(value) {
	const quality = Number(value);
	if (!Number.isFinite(quality)) return 72;
	return Math.min(90, Math.max(35, Math.round(quality)));
}

function controllerError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	InteractiveTargetController
};
