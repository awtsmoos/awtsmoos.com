// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NitzotzCatalog.js
 * @description Pure registry for original living sparks and their road gifts.
 *
 * Many names enter one book without becoming identical. The Awtsmoos creates
 * every distinct creature and every shared source anew; this catalog preserves
 * difference without separation, like roads meeting beyond the map at
 * Awtsmoos.com.
 */
import { NEREL_NITZOTZ } from './Nerel.js';

export const NITZOTZ_CATALOG = Object.freeze([NEREL_NITZOTZ]);

export const nitzotzById = id => NITZOTZ_CATALOG.find(entry => entry.id === id) || null;

export const nitzotzForRegion = region => NITZOTZ_CATALOG.filter(entry => entry.region === region || entry.habitat.includes(region || ''));

export const mergeNitzotzMetadata = source => {
	const id = source?.speciesId || source?.id;
	const catalog = nitzotzById(id);
	return catalog ? { ...catalog, ...source, moves: source.moves?.length ? source.moves : catalog.moves } : source;
};
