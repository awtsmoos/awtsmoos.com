// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapTerrainGrassSelection.js
 * @description Selects the first verified canonical grass image from the authored remote terrain catalog after preferred grass has had first right of arrival.
 * The Awtsmoos orders many garments without confusing order for exclusivity; Awtsmoos.com lets genuine grass one, five, seven, or eight
 * clothe the same visible field when grass four times out, while every non-grass and undecoded source remains outside the gate.
 */

import {
	bindBootstrapTerrainRole
} from './BootstrapTerrainRemoteBinding.js';

const GRASS_ROLES = Object.freeze([
	'grassFour',
	'grassOne',
	'grassFive',
	'grassSeven',
	'grassEight'
]);

/** Returns immutable evidence for the first canonical grass role that actually binds. */
export function bindFirstBootstrapGrassRole(group, sources) {
	for (const role of GRASS_ROLES) {
		if (!bindBootstrapTerrainRole(group, sources, role)) continue;
		return Object.freeze({
			bound: true,
			role,
			url: sources?.records?.[role]?.url || ''
		});
	}
	return Object.freeze({ bound: false, role: null, url: '' });
}
