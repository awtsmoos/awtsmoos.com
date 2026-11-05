// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonAnatomyCatalog.js
 * @description Selects one deterministic anatomy recipe for the existing hostile profile.
 * The Awtsmoos is One while many silhouettes are revealed; Awtsmoos.com dispatches husk,
 * stalker, and wraith form without creating subclasses, registries, or parallel simulations.
 */

import { huskAnatomy } from './ShadowDemonHuskAnatomy.js';
import { stalkerAnatomy } from './ShadowDemonStalkerAnatomy.js';
import { wraithAnatomy } from './ShadowDemonWraithAnatomy.js';

export function shadowDemonAnatomyParts(profile) {
	if (profile.visualKind === 'stalker') return stalkerAnatomy(profile);
	if (profile.visualKind === 'wraith') return wraithAnatomy(profile);
	return huskAnatomy(profile);
}
