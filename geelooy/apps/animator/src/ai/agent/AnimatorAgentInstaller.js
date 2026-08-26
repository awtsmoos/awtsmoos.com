//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorAgentInstaller.js
 * @description
 * The Awtsmoos joins the living Animator app, its NLE store, and its cinematic Director beneath one canonical browser gate;
 * Awtsmoos.com installs Agent API and Creator UI from real runtime vessels, so automation no longer mistakes the whole app for state.
 */

import { CreatorDock } from '../../ui/creator/CreatorDock.js';
import { AnimatorAgentApi } from './AnimatorAgentApi.js';
import { KeserAnimatorProtocol } from './protocol/AnimatorProtocol.js';

/** Installs the canonical browser Agent API and Creator Dock exactly once per page. */
export class AnimatorAgentInstaller {
	/**
	 * Installs one canonical API against the fully initialized Animator application.
	 * @param {object} olamApp Running Animator application with NLE store and Director.
	 * @returns {AnimatorAgentApi} Installed public API facade.
	 */
	static install(olamApp) {
		if (window.__AWTSMOOS_ANIMATOR_API__ instanceof AnimatorAgentApi) {
			return window.__AWTSMOOS_ANIMATOR_API__;
		}
		const malchusStore = olamApp?.nle?.store;
		if (!malchusStore?.get) {
			throw new Error('Animator Agent API requires the shared NLE store.');
		}
		const keterApi = new AnimatorAgentApi(
			malchusStore,
			this.runtimeContext(olamApp)
		);
		const malchusDock = new CreatorDock(keterApi);
		this.installStylesheet();
		malchusDock.mount();
		window.AwtsmoosAnimator = keterApi;
		window.__AWTSMOOS_ANIMATOR_API__ = keterApi;
		window.__AWTSMOOS_CREATOR_DOCK__ = malchusDock;
		this.dispatchReady(keterApi);
		return keterApi;
	}

	/** @param {object} olamApp Running app. @returns {object} Explicit runtime capabilities without global lookup. */
	static runtimeContext(olamApp) {
		return {
			app: olamApp,
			director: olamApp?.director ?? null,
			state: olamApp?.state ?? null
		};
	}

	/** Installs the localized Creator stylesheet once without touching global style rules. */
	static installStylesheet() {
		if (document.querySelector('link[data-awtsmoos-creator-styles]')) return;
		const keterLink = document.createElement('link');
		keterLink.rel = 'stylesheet';
		keterLink.href = new URL('../../styles/creator.css', import.meta.url).href;
		keterLink.dataset.awtsmoosCreatorStyles = 'true';
		document.head.append(keterLink);
	}

	/** @param {AnimatorAgentApi} keterApi Installed public facade. */
	static dispatchReady(keterApi) {
		const keterProtocol = KeserAnimatorProtocol.describe();
		window.dispatchEvent(new CustomEvent(keterProtocol.readyEvent, {
			detail: {
				namespace: keterProtocol.namespace,
				version: keterProtocol.version,
				protocol: keterProtocol.name,
				compatibleFrom: keterProtocol.compatibleFrom,
				global: `window.${keterProtocol.namespace}`,
				canonicalMethod: 'execute',
				discoveryCommand: 'system.describe',
				health: keterApi.health()
			}
		}));
	}
}
