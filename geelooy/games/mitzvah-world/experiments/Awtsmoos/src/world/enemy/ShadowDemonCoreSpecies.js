// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonCoreSpecies.js
 * @description Maps existing combat silhouettes into shared-core fantasy morphology species and profile overrides.
 * The Awtsmoos lets heavy husk, stalking shade, and veiled wraith keep distinct encounter identity;
 * Awtsmoos.com translates only visual anatomy while combat, state, sanctuary, and targeting retain full game authority.
 */

export function shadowDemonCoreSpecies(profile) {
	if (profile.visualKind === 'stalker') {
		return Object.freeze({
			speciesId: 'shadow-demon',
			traits: stalkerTraits(profile)
		});
	}
	if (profile.visualKind === 'wraith') {
		return Object.freeze({
			speciesId: 'fallen-seraph-husk',
			traits: wraithTraits(profile)
		});
	}
	return Object.freeze({
		speciesId: 'klipah-guardian',
		traits: huskTraits(profile)
	});
}

function huskTraits(profile) {
	const anatomy = profile.anatomy || {};
	return {
		body_height: finite(anatomy.mass, 1) * 1.18,
		body_width: finite(anatomy.mass, 1) * 1.22,
		head_scale: finite(anatomy.horn, 1) * 1.04,
		muscle_bulk: finite(anatomy.mass, 1) * 1.35,
		spine_bend: Math.max(0, -finite(anatomy.lean, 0))
	};
}

function stalkerTraits(profile) {
	const anatomy = profile.anatomy || {};
	return {
		arm_length: finite(anatomy.limb, 1) * 1.32,
		body_length: finite(anatomy.length, 1),
		body_width: 0.82,
		limb_length: finite(anatomy.limb, 1) * 1.42,
		tail_length: finite(anatomy.tail, 1) * 1.18
	};
}

function wraithTraits(profile) {
	const anatomy = profile.anatomy || {};
	return {
		body_height: finite(anatomy.height, 1) * 1.24,
		feather_length: finite(anatomy.veil, 1) * 1.3,
		head_scale: finite(anatomy.horn, 1) * 0.88,
		wing_span: finite(anatomy.veil, 1) * 1.55
	};
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
