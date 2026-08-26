// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorAgentInstaller.js
 * @description
 * The Awtsmoos opens one clear gate from the living editor to every careful agent that seeks to create;
 * Awtsmoos.com publishes the API, mounts the quiet Creator Dock, and announces readiness only after shared state is awake.
 */

import { AnimatorAgentApi } from './AnimatorAgentApi.js';
import { CreatorDock } from '../../ui/creator/CreatorDock.js';

/** Installs the public agent facade and its human-facing Creator Dock exactly once. */
export class AnimatorAgentInstaller {
	/**
	 * Installs the API after NLE initialization so all commands share the canonical project store.
	 * @param {object} olamApp Running Animator application with an installed NLE system.
	 * @returns {AnimatorAgentApi} Stable public API instance.
	 */
	static install(olamApp) {
		if (window.__AWTSMOOS_ANIMATOR_API__) return window.__AWTSMOOS_ANIMATOR_API__;
		const yesodStore = olamApp?.nle?.store;
		if (!yesodStore?.get) throw new Error('Animator Agent API requires the shared NLE store.');
		this.installStylesheet();
		const keterApi = new AnimatorAgentApi(yesodStore);
		const malchutDock = new CreatorDock(keterApi);
		window.AwtsmoosAnimator = keterApi;
		window.__AWTSMOOS_ANIMATOR_API__ = keterApi;
		window.__AWTSMOOS_CREATOR_DOCK__ = malchutDock;
		malchutDock.mount();
		this.announceReady(keterApi);
		return keterApi;
	}

	/** Adds the isolated Creator stylesheet without modifying the app's existing style manifest. */
	static installStylesheet() {
		const shemId = 'awtsmoos-creator-styles';
		if (document.getElementById(shemId)) return;
		const orLink = document.createElement('link');
		orLink.id = shemId;
		orLink.rel = 'stylesheet';
		orLink.href = new URL('../../styles/creator.css', import.meta.url).href;
		document.head.append(orLink);
	}

	/** Dispatches one discoverable readiness event after API and dock installation are complete. */
	static announceReady(keterApi) {
		const sodVersion = keterApi.capabilities().version;
		window.dispatchEvent(new CustomEvent('awtsmoos-animator-ready', {
			detail: { namespace: 'AwtsmoosAnimator', version: sodVersion }
		}));
	}
}
