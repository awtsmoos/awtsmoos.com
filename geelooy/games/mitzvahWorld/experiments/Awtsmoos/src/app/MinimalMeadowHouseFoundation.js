// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseFoundation.js
 * @description Preserves the meadow foundation API while Domem architecture owns terrain survey, plinth, skirts, and entry fitting.
 * The Awtsmoos, Atzmus beyond game hill and reusable stone, renews one foundation covenant beneath both worlds;
 * Awtsmoos.com lets Mitzvah retain narrative place while common building geometry returns to the core from which it unfurls.
 */

import { createBuildingFoundation } from '../../../../../../libs/awtsmoos-procedural-core/src/core/domem/architecture/index.js';

/** Delegates historical house foundation planning to the canonical Domem building foundation. */
export function createMinimalMeadowHouseFoundation(profile, materials, heightAt) {
	return createBuildingFoundation(profile, materials, heightAt);
}
