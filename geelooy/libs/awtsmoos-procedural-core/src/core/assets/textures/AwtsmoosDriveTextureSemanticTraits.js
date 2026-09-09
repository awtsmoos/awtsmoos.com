// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosDriveTextureSemanticTraits.js
 * @description Extracts material traits that improve AI discovery without pretending a filename is laboratory measurement.
 * The Awtsmoos gives finite words their bounded usefulness; Awtsmoos.com records only traits explicitly witnessed by names and existing tags.
 */

const TRAIT_RULES = Object.freeze([
	trait(['porous', 'pore', 'vesicle', 'foam', 'sponge', 'cork'], ['porous']),
	trait(['woven', 'weave', 'canvas', 'linen', 'cotton', 'denim', 'wool', 'mesh', 'carbon fiber'], ['woven', 'fibrous']),
	trait(['fiber', 'fibrous', 'felt', 'suede', 'velvet', 'mineral wool'], ['fibrous']),
	trait(['crystal', 'crystalline', 'quartz', 'granite', 'salt', 'halite', 'sulfur'], ['crystalline']),
	trait(['smooth', 'glass', 'oil'], ['smooth']),
	trait(['rough', 'gravel', 'rock', 'rust'], ['rough']),
	trait(['matte'], ['matte']),
	trait(['gloss', 'glassy', 'reflective', 'metallic'], ['reflective']),
	trait(['transparent', 'clear glass'], ['transparent']),
	trait(['translucent', 'ice', 'amber', 'resin'], ['translucent']),
	trait(['granular', 'grain', 'sand', 'dust', 'gravel', 'pebble'], ['granular']),
	trait(['layered', 'lamination', 'shale', 'slate', 'plywood'], ['layered']),
	trait(['flexible', 'rubber', 'fabric', 'leather'], ['flexible']),
	trait(['liquid', 'oil', 'water'], ['liquid']),
	trait(['solid'], ['solid']),
	trait(['raw', 'unfinished', 'untreated'], ['raw']),
	trait(['brushed'], ['brushed', 'directional-grain']),
	trait(['corrugated'], ['corrugated']),
	trait(['mesh'], ['perforated', 'mesh']),
	trait(['rust', 'oxide'], ['oxidized']),
	trait(['tileable', 'seamless'], ['seamless'])
]);

/** Returns every explicitly suggested surface trait. */
export function awtsmoosDriveTextureTraits(text) {
	const normalized = String(text || '').toLowerCase();
	const traits = [];
	for (const entry of TRAIT_RULES) {
		if (entry.keywords.some(keyword => normalized.includes(keyword))) {
			traits.push(...entry.labels);
		}
	}
	return Object.freeze([...new Set(traits)].sort());
}

function trait(keywords, labels) {
	return Object.freeze({
		keywords: Object.freeze(keywords),
		labels: Object.freeze(labels)
	});
}
