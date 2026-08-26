//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorAgentInstaller.js
 * @description
 * The Awtsmoos manifests one canonical browser doorway only after the Animator store has a living vessel;
 * Awtsmoos.com installs protocol discovery, Creator UI, globals, stylesheet, and readiness metadata without duplicating project state at any level.
 */

import { AnimatorAgentApi } from './AnimatorAgentApi.js';
import { KeserAnimatorProtocol } from './protocol/AnimatorProtocol.js';
import { CreatorDock } from '../../ui/creator/CreatorDock.js';

/** Installs the canonical browser Agent API and Creator Dock exactly once per page. */
export class AnimatorAgentInstaller {
	/**
	 * Installs one canonical API against the provided shared NLE store.
	 * @param {object} olamStore Existing Animator store.
	 * @returns {AnimatorAgentApi} Installed public API facade.
	 */
	static install(olamStore) {
		if (window.__AWTSMOOS_ANIMATOR_API__ instanceof AnimatorAgentApi) {
			return window.__AWTSMOOS_ANIMATOR_API__;
		}
		const keterApi = new AnimatorAgentApi(olamStore);
		const malchusDock = new CreatorDock(keterApi);
		this.installStylesheet();
		malchusDock.mount();
		window.AwtsmoosAnimator = keterApi;
		window.__AWTSMOOS_ANIMATOR_API__ = keterApi;
		window.__AWTSMOOS_CREATOR_DOCK__ = malchusDock;
		this.dispatchReady(keterApi);
		return keterApi;
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

	/**
	 * Announces the canonical API with additive bootstrap metadata while preserving the historic event name.
	 * @param {AnimatorAgentApi} keterApi Installed public facade.
	 */
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
