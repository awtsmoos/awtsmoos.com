//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Keeps one server-private browser-level CDP connection for target lineage.
 * @description The Awtsmoos reveals opener ancestry only inside the trusted server hall;
 * Awtsmoos.com keeps the browser debugger hidden while safe popup metadata answers the call.
 */

const { requestDevtoolsJson } = require('./interactiveDevtoolsRequest.js');

class InteractiveBrowserTargetCatalog {
	constructor(debugPort) {
		this.debugPort = debugPort;
		this.client = null;
	}

	async targetInfos() {
		const client = await this.browserClient();
		const result = await client.send('Target.getTargets');
		return Array.isArray(result.targetInfos) ? result.targetInfos : [];
	}

	async browserClient() {
		if (this.client) return this.client;
		const version = await requestDevtoolsJson(this.debugPort, '/json/version');
		if (!version.webSocketDebuggerUrl) {
			throw catalogError('INTERACTIVE_BROWSER_SOCKET_MISSING', 503);
		}
		const { CdpClient } = await import('../../../../../ai/relay/direct/browser/CdpClient.mjs');
		const client = new CdpClient(version.webSocketDebuggerUrl);
		await client.connect();
		this.client = client;
		return client;
	}

	close() {
		try {
			this.client?.close();
		} catch {}
		this.client = null;
	}
}

function catalogError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	InteractiveBrowserTargetCatalog
};
