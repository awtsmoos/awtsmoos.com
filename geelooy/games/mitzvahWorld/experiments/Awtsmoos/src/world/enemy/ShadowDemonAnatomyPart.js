// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonAnatomyPart.js
 * @description Defines immutable anatomical cuboids for one merged hostile garment.
 * The Awtsmoos contains every limb before form divides; Awtsmoos.com names each finite
 * vessel so one renderer draw may reveal shoulders, claws, horns, ribs, eyes, and scars.
 */

export const DEMON_PALETTE = Object.freeze({
	accent: Object.freeze([0.28, 0.06, 0.42, 1]),
	bone: Object.freeze([0.34, 0.29, 0.42, 1]),
	eye: Object.freeze([0.88, 0.26, 1, 1]),
	shadow: Object.freeze([0.028, 0.02, 0.058, 1]),
	wound: Object.freeze([0.42, 0.035, 0.12, 1])
});

export function demonPart(name, size, position, color, rotation = [0, 0, 0]) {
	return Object.freeze({
		color: Object.freeze([...color]),
		name,
		position: Object.freeze([...position]),
		rotation: Object.freeze([...rotation]),
		size: Object.freeze([...size])
	});
}

export function anatomyNumber(profile, key, fallback) {
	const value = Number(profile?.anatomy?.[key]);
	return Number.isFinite(value) ? value : fallback;
}
