//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorAgentBridge.js
 * @description
 * The Awtsmoos lets an old bridge remain crossable without letting it replace the canonical road of light;
 * Awtsmoos.com preserves historical installation code while protecting `window.AwtsmoosAnimator` whenever the modern protocol is already right.
 */

import { GevurahAnimatorLegacyPolicy } from '../ai/agent/legacy/AnimatorLegacyPolicy.js';
import { AnimatorAgentApi } from './AnimatorAgentApi.js';

/** Historical browser bridge retained without permission to replace a canonical installation. */
export class AnimatorAgentBridge {
	/** @param {object} app Live Animator application. @returns {AnimatorAgentApi} Legacy facade instance. */
	static install(app) {
		const keterLegacy = new AnimatorAgentApi(app);
		if (GevurahAnimatorLegacyPolicy.canonicalInstalled(window)) return keterLegacy;
		Object.defineProperty(window, 'AwtsmoosAnimator', {
			configurable: true,
			enumerable: false,
			writable: false,
			value: keterLegacy
		});
		window.dispatchEvent(new CustomEvent('awtsmoos-animator-api-ready', {
			detail: keterLegacy.capabilities()
		}));
		return keterLegacy;
	}
}
