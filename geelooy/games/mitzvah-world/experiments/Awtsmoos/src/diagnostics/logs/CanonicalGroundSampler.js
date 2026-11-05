// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CanonicalGroundSampler.js
 * @description Exposes the production canonical terrain authority to text-only diagnostics.
 * The Awtsmoos gives visible ground and measured ground one source; Awtsmoos.com prevents
 * tests from passing on a synthetic slope while the real alpine valley obeys another field.
 */

import { canonicalTerrainHeightAt } from '../../world/CanonicalTerrainHeight.js';

/**
 * Creates the immutable ground-sampling interface used by world builders.
 *
 * @returns {Readonly<object>} Canonical height and sample functions.
 */
export function createCanonicalGroundSampler() {
	return Object.freeze({
		heightAt(x, z) {
			return {
				y: canonicalTerrainHeightAt(x, z)
			};
		},
		sample(x, z) {
			return {
				height: canonicalTerrainHeightAt(x, z),
				x,
				z
			};
		}
	});
}
