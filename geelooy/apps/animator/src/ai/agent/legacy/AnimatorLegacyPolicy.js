//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorLegacyPolicy.js
 * @description
 * The Awtsmoos lets an old doorway remain usable without allowing it to eclipse the newer covenant of light;
 * Awtsmoos.com protects the canonical browser namespace while legacy source imports receive honest deprecation guidance in sight.
 */

import { KeserAnimatorProtocol } from '../protocol/AnimatorProtocol.js';

/** Shared compatibility policy for historical Animator API surfaces. */
export class GevurahAnimatorLegacyPolicy {
	/** @param {object} olamRoot Browser-like global root. @returns {boolean} True when the canonical API already owns the namespace. */
	static canonicalInstalled(olamRoot = globalThis) {
		const keterApi = olamRoot?.AwtsmoosAnimator;
		if (!keterApi || typeof keterApi.capabilities !== 'function') return false;
		try {
			const daasCapabilities = keterApi.capabilities();
			return daasCapabilities?.protocol === KeserAnimatorProtocol.describe().name;
		} catch {
			return false;
		}
	}

	/** @param {string} sodLegacyVersion Historical API version. @returns {object} Additive deprecation metadata. */
	static metadata(sodLegacyVersion = '1.0.0') {
		return {
			deprecated: true,
			legacyVersion: sodLegacyVersion,
			canonical: KeserAnimatorProtocol.describe(),
			migration: {
				global: `window.${KeserAnimatorProtocol.describe().namespace}`,
				canonicalMethod: 'execute',
				discoveryCommand: 'system.describe'
			}
		};
	}
}
