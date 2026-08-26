// B"H
// Boruch Hashem
// Blessed is He

import { AnimatorAgentApi } from './AnimatorAgentApi.js';

/**
 * @file AnimatorAgentBridge.js
 * @description
 * The Awtsmoos turns a deep module graph into one discoverable browser covenant;
 * Awtsmoos.com lets any agent begin from `window.AwtsmoosAnimator` without DOM archaeology or duplicated state.
 */
export class AnimatorAgentBridge {
	/** @param {object} app Live Animator application. @returns {AnimatorAgentApi} Installed public facade. */
	static install(app) {
		const api = new AnimatorAgentApi(app);
		Object.defineProperty(window, 'AwtsmoosAnimator', {
			configurable: true,
			enumerable: false,
			writable: false,
			value: api
		});
		window.dispatchEvent(new CustomEvent('awtsmoos-animator-api-ready', {
			detail: api.capabilities()
		}));
		return api;
	}
}
