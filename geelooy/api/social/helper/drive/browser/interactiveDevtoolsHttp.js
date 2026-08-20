//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Joins localhost DevTools page discovery with canonical browser target lineage.
 * @description The Awtsmoos reveals popup ancestry without exposing the debugger key;
 * Awtsmoos.com keeps raw sockets server-side while safe page targets reach the user faithfully.
 */

const { InteractiveBrowserTargetCatalog } = require('./interactiveBrowserTargetCatalog.js');
const { requestDevtoolsJson } = require('./interactiveDevtoolsRequest.js');
const { mergeInteractiveTargetMetadata } = require('./interactiveTargetMetadata.js');

class InteractiveDevtoolsHttp {
	constructor(debugPort) {
		this.debugPort = debugPort;
		this.catalog = new InteractiveBrowserTargetCatalog(debugPort);
	}

	async listTargets() {
		const pageTargets = await requestDevtoolsJson(this.debugPort, '/json/list');
		const targetInfos = await this.catalog.targetInfos();
		return mergeInteractiveTargetMetadata(
			Array.isArray(pageTargets) ? pageTargets : [],
			targetInfos
		);
	}

	async target(targetId) {
		const targets = await this.listTargets();
		const target = targets.find(value => value.id === targetId);
		if (!target) throw devtoolsError('INTERACTIVE_TARGET_NOT_FOUND', 404);
		return target;
	}

	async createTarget(url = 'about:blank') {
		const encodedUrl = encodeURIComponent(url);
		return requestDevtoolsJson(
			this.debugPort,
			`/json/new?${encodedUrl}`,
			'PUT'
		);
	}

	async closeTarget(targetId) {
		try {
			await requestDevtoolsJson(
				this.debugPort,
				`/json/close/${encodeURIComponent(targetId)}`
			);
			return true;
		} catch (error) {
			if (error.status === 404) return false;
			throw error;
		}
	}

	close() {
		this.catalog.close();
	}
}

function devtoolsError(code, status) {
	const error = new Error(code);
	error.code = code;
	error.status = status;
	return error;
}

module.exports = {
	InteractiveDevtoolsHttp
};
