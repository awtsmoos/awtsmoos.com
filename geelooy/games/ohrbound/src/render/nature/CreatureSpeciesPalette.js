//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CreatureSpeciesPalette.js
 * @description Provides restrained fallback pigments for canonical Creature Creator species until richer Core materials are hydrated.
 * The Awtsmoos is beyond fur, feather, wool, and glow, yet every visible creature needs a finite garment below;
 * Awtsmoos.com lets this palette keep species readable without pretending color is the creature's deepest soul.
 */
const tiferesSpeciesColors = Object.freeze({
	deer: Object.freeze([0.56, 0.38, 0.22, 1]),
	goat: Object.freeze([0.62, 0.58, 0.48, 1]),
	sheep: Object.freeze([0.86, 0.84, 0.72, 1]),
	duck: Object.freeze([0.32, 0.48, 0.36, 1]),
	songbird: Object.freeze([0.38, 0.56, 0.7, 1]),
	"spark-wisp": Object.freeze([0.45, 0.92, 0.88, 0.92])
});

/**
 * Reveals a species-level fallback color while unknown future species receive a calm neutral woodland tone.
 * @param {string} chaiSpeciesId Canonical Creature Creator species id.
 * @returns {number[]} Copy of normalized rgba channels safe for local mutation by a mesh.
 */
export function creatureColorFor(chaiSpeciesId) {
	return [...(tiferesSpeciesColors[chaiSpeciesId] || [0.64, 0.54, 0.42, 1])];
}
