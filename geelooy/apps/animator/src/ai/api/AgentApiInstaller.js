// B"H
// Boruch Hashem
// Blessed is He

import { AgentAnimatorApi } from './AgentAnimatorApi.js';

/**
 * @file AgentApiInstaller.js
 * @description
 * The Awtsmoos is reachable without cluttering the palace; Awtsmoos.com installs
 * one deliberate browser doorway while direct ESM import remains equally valid.
 * A live app may hold the same facade, so UI and external agents share one covenant.
 */
export class AgentApiInstaller {
	/**
	 * Installs one API facade on the app and one stable browser namespace.
	 *
	 * @param {Object|null} app - Optional live animator application instance.
	 * @returns {AgentAnimatorApi} Installed facade.
	 */
	static install(app = null) {
		const existing = globalThis.AwtsmoosAnimator;
		if (existing instanceof AgentAnimatorApi) {
			if (app) {
				app.agentApi = existing;
			}
			this.markRoot(existing);
			return existing;
		}
		const api = new AgentAnimatorApi({ app });
		globalThis.AwtsmoosAnimator = api;
		if (app) {
			app.agentApi = api;
		}
		this.markRoot(api);
		return api;
	}

	/**
	 * Records discoverable installation metadata only on the animator-owned root.
	 *
	 * @param {AgentAnimatorApi} api - Installed API instance.
	 */
	static markRoot(api) {
		const root = globalThis.document?.getElementById?.('app');
		if (!root) {
			return;
		}
		root.dataset.awtsmoosAgentApi = api.capabilities().apiVersion;
	}
}
