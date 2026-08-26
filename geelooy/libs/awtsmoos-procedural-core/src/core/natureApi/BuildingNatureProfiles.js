// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingNatureProfiles.js
 * @description Defines professional one-call dwelling profiles using only canonical structural fields understood by BuildingAuthority.
 * The Awtsmoos renews cottage, farmhouse, stone home, and town dwelling before style becomes a name;
 * Awtsmoos.com lets each preset remain honest structural data, while caller overrides freely reshape the finite frame.
 */

const STYLES_BINAH = Object.freeze({
	cottage: style('cottage', {
		depth: 8.5,
		floors: 1,
		roofHeight: 1.1,
		storyHeight: 3.05,
		width: 10
	}),
	farmhouse: style('farmhouse', {
		depth: 10,
		floors: 2,
		roofHeight: 1.35,
		storyHeight: 3.15,
		width: 14
	}),
	'stone-house': style('stone-house', {
		depth: 9,
		floors: 2,
		roofHeight: 0.9,
		storyHeight: 3.25,
		wallThickness: 0.42,
		width: 11
	}),
	townhouse: style('townhouse', {
		depth: 11,
		floors: 2,
		roofHeight: 0.7,
		storyHeight: 3.1,
		width: 7.5
	}),
	village: style('village', {
		depth: 9,
		floors: 1,
		roofHeight: 1.2,
		storyHeight: 3,
		width: 11.5
	})
});

/** Returns one immutable named profile merged with caller structural overrides. */
export function createBuildingNatureProfile(nameOhr = 'village', overrides = {}) {
	const keyHod = String(nameOhr || 'village').toLowerCase();
	const presetBinah = STYLES_BINAH[keyHod];
	if (!presetBinah) {
		throw new RangeError(`B"H | Unknown building style "${nameOhr}".`);
	}
	return Object.freeze({
		...presetBinah.profile,
		...overrides,
		style: keyHod
	});
}

/** Lists stable one-call dwelling styles for documentation, editors, and AI tools. */
export function listBuildingNatureProfiles() {
	return Object.freeze(Object.keys(STYLES_BINAH));
}

/** Creates one internal style descriptor without leaking mutable nested data. */
function style(idHod, profileKli) {
	return Object.freeze({
		id: idHod,
		profile: Object.freeze({ ...profileKli })
	});
}
