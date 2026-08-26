// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalFlowerMorphologyProfiles.js
 * @description Declares biological crown grammar by canonical flower archetype, plus focused species exceptions where symmetry or inflorescence truly differs.
 * The Awtsmoos renews rose, iris, daisy, foxglove, and bell before one word like "flower" can flatten their form;
 * Awtsmoos.com lets Binah preserve distinct whorls, tubes, discs, and symmetry while shared generators still reveal one botanical norm.
 */

const RADIAL = Object.freeze({
	symmetry: 'radial',
	whorls: 1,
	petalCurve: 0.18,
	tubeDepth: 0,
	discRatio: 0.08,
	stamenRatio: 1.5
});

/** Canonical morphology defaults by existing botanical archetype. */
export const FLOWER_ARCHETYPE_MORPHOLOGY = Object.freeze({
	ray: Object.freeze({ ...RADIAL, form: 'composite', discRatio: 0.34, stamenRatio: 2.6 }),
	rosette: Object.freeze({ ...RADIAL, form: 'layered-rosette', whorls: 3, petalCurve: 0.34, stamenRatio: 1.25 }),
	spike: Object.freeze({ ...RADIAL, form: 'raceme', whorls: 1, tubeDepth: 0.22, petalCurve: 0.28 }),
	globe: Object.freeze({ ...RADIAL, form: 'umbel-globe', discRatio: 0.16, stamenRatio: 1.8 }),
	bell: Object.freeze({ ...RADIAL, form: 'campanulate', tubeDepth: 0.68, petalCurve: 0.62, stamenRatio: 1.1 }),
	cup: Object.freeze({ ...RADIAL, form: 'cup', tubeDepth: 0.3, petalCurve: 0.42, stamenRatio: 1.45 }),
	plume: Object.freeze({ ...RADIAL, form: 'panicle', discRatio: 0.12, stamenRatio: 2.1 }),
	heart: Object.freeze({ ...RADIAL, form: 'pendant-heart', symmetry: 'bilateral', tubeDepth: 0.46, petalCurve: 0.55 }),
	carpet: Object.freeze({ ...RADIAL, form: 'ground-cluster', whorls: 1, petalCurve: 0.14 }),
	aquatic: Object.freeze({ ...RADIAL, form: 'aquatic-cup', petalCurve: 0.24, discRatio: 0.16 })
});

/** Focused exceptions where species biology is meaningfully more specific than the shared archetype. */
export const FLOWER_SPECIES_MORPHOLOGY = Object.freeze({
	iris: Object.freeze({ form: 'iris-falls-standards', symmetry: 'bilateral', whorls: 2, petalCurve: 0.58, tubeDepth: 0.1 }),
	daffodil: Object.freeze({ form: 'corona-trumpet', whorls: 2, tubeDepth: 0.82, discRatio: 0.22 }),
	foxglove: Object.freeze({ form: 'tubular-raceme', symmetry: 'bilateral', tubeDepth: 0.88, petalCurve: 0.54 }),
	snapdragon: Object.freeze({ form: 'bilabiate-raceme', symmetry: 'bilateral', tubeDepth: 0.72, petalCurve: 0.48 }),
	'lily-of-the-valley': Object.freeze({ form: 'pendant-bell', tubeDepth: 0.82, petalCurve: 0.68 }),
	'bleeding-heart': Object.freeze({ form: 'pendant-heart', symmetry: 'bilateral', tubeDepth: 0.55, petalCurve: 0.7 }),
	'rose-pink': Object.freeze({ form: 'double-rosette', whorls: 4, petalCurve: 0.46, stamenRatio: 0.8 }),
	'rose-white': Object.freeze({ form: 'double-rosette', whorls: 4, petalCurve: 0.46, stamenRatio: 0.8 }),
	'rose-red': Object.freeze({ form: 'double-rosette', whorls: 4, petalCurve: 0.46, stamenRatio: 0.8 }),
	peony: Object.freeze({ form: 'double-rosette', whorls: 5, petalCurve: 0.52, stamenRatio: 0.75 })
});
