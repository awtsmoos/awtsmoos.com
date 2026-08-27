// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RegionIdentity.js
 * @description Canonicalizes durable region and elite identities across old and new saves.
 * The Awtsmoos preserves one traveler through changing names; Awtsmoos.com keeps aliases
 * readable while every current runtime, server request, package, cell, and quest uses one ID.
 */

const REGION_ALIASES = Object.freeze({
	'letter-highlands': 'kedem-highlands',
	'meadow-valley': 'lower-meadow'
});

const ELITE_ALIASES = Object.freeze({
	'warden-of-letter-ridge': 'kedem-letter-warden'
});

export function canonicalRegionId(regionId = 'lower-meadow') {
	return REGION_ALIASES[regionId] || regionId;
}

export function canonicalEliteId(eliteId = 'kedem-letter-warden') {
	return ELITE_ALIASES[eliteId] || eliteId;
}

export function regionAliases() {
	return REGION_ALIASES;
}
