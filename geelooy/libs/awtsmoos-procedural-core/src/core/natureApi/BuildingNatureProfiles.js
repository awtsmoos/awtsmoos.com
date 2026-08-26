// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingNatureProfiles.js
 * @description Defines human-scale dwelling presets with structural envelope, roof, glazing, porch, and chimney intent.
 * The Awtsmoos renews cottage, farmhouse, stone home, and town dwelling before style receives a name;
 * Awtsmoos.com lets every preset remain honest canonical data while expert overrides freely reshape the architectural flame.
 */

const STYLES_BINAH = Object.freeze({
	cottage: style({
		depth: 8.5,
		floors: 1,
		porch: true,
		porchDepth: 2,
		roofHeight: 1.35,
		roofSteps: 5,
		roofStyle: 'gable',
		storyHeight: 3.05,
		windowColumns: 2,
		width: 10
	}),
	farmhouse: style({
		chimney: true,
		depth: 10,
		floors: 2,
		porch: true,
		porchDepth: 2.4,
		roofHeight: 1.65,
		roofSteps: 6,
		roofStyle: 'gable',
		storyHeight: 3.15,
		windowColumns: 3,
		width: 14
	}),
	'stone-house': style({
		chimney: true,
		depth: 9,
		floors: 2,
		porch: false,
		roofHeight: 1.25,
		roofSteps: 5,
		roofStyle: 'hip',
		storyHeight: 3.25,
		wallThickness: 0.42,
		windowColumns: 2,
		width: 11
	}),
	townhouse: style({
		chimney: false,
		depth: 11,
		floors: 2,
		porch: false,
		roofHeight: 0.55,
		roofStyle: 'flat',
		storyHeight: 3.1,
		windowColumns: 2,
		width: 7.5
	}),
	village: style({
		chimney: true,
		depth: 9,
		floors: 1,
		porch: true,
		porchDepth: 1.8,
		roofHeight: 1.35,
		roofSteps: 5,
		roofStyle: 'gable',
		storyHeight: 3,
		windowColumns: 2,
		width: 11.5
	})
});

/** Returns one named immutable profile merged with caller structural and facade overrides. */
export function createBuildingNatureProfile(nameOhr = 'village', overrides = {}) {
	const keyHod = String(nameOhr || 'village').toLowerCase();
	const presetBinah = STYLES_BINAH[keyHod];
	if (!presetBinah) {
		throw new RangeError(`B"H | Unknown building style "${nameOhr}".`);
	}
	return Object.freeze({
		...presetBinah,
		...overrides,
		style: keyHod
	});
}

/** Lists stable one-call dwelling styles for editors, docs, schemas, and AI tools. */
export function listBuildingNatureProfiles() {
	return Object.freeze(Object.keys(STYLES_BINAH));
}

/** Freezes one internal style record. */
function style(profileKli) {
	return Object.freeze({ ...profileKli });
}
