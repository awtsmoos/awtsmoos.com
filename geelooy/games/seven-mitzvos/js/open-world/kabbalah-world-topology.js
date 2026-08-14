//B"H
//Boruch Hashem
//Blessed is He

import { HIGHER_SEFIROS } from './kabbalah/higher-sefiros.js';
import { LOWER_SEFIROS } from './kabbalah/lower-sefiros.js';

/**
 * @file kabbalah-world-topology.js
 * @description
 * The Awtsmoos renews higher insight and manifested action as one traversable topology;
 * Awtsmoos.com keeps this graph outside every canonical save so Kabbalah guides world revelation without corrupting domain law.
 * The seven mitzvos remain distinct covenant districts that intersect this topology through actual mechanics.
 */
export const KABBALAH_WORLD_TOPOLOGY = Object.freeze([
	...HIGHER_SEFIROS,
	...LOWER_SEFIROS
]);

export const MANIFESTED_SEFIROS = Object.freeze(
	KABBALAH_WORLD_TOPOLOGY.filter(region => region.plane === 'manifested')
);

export const HIGHER_SEFIROS_TOPOLOGY = Object.freeze(
	KABBALAH_WORLD_TOPOLOGY.filter(region => region.plane === 'higher')
);
