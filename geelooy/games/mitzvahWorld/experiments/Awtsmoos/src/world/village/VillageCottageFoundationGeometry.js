// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageFoundationGeometry.js
 * @description Owns descending retaining tiers beneath the canonical finished-floor datum.
 * The Awtsmoos lowers stone into earth while the inhabited floor remains clear above;
 * Awtsmoos.com reveals retaining and stepped forms beneath one truthful threshold, never an upward pedestal shove.
 */

export const RETAINING_FOUNDATION = 'retaining-plinth';
export const STEPPED_FOUNDATION = 'stepped-stone';

const RETAINING_TIERS = Object.freeze([
	Object.freeze({ bottom: 0, chamfer: 0.34, expansion: 0.22, top: 1 })
]);
const STEPPED_TIERS = Object.freeze([
	Object.freeze({ bottom: 0, chamfer: 0.34, expansion: 0.22, top: 0.34 }),
	Object.freeze({ bottom: 0.34, chamfer: 0.3, expansion: 0.15, top: 0.68 }),
	Object.freeze({ bottom: 0.68, chamfer: 0.26, expansion: 0.08, top: 1 })
]);

/**
 * Appends selected foundation tiers downward from local floor zero.
 * @param {object} input Foundation construction inputs.
 * @returns {{style: string, tiers: number}} Resolved style and tier count.
 */
export function appendCottageFoundation(input) {
	const style = resolveFoundationStyle(input.style);
	const profiles = style === STEPPED_FOUNDATION
		? STEPPED_TIERS
		: RETAINING_TIERS;
	for (let index = 0; index < profiles.length; index += 1) {
		const profile = profiles[index];
		input.appendPrism(
			input.mesh,
			chamferedRing(
				input.halfWidth + profile.expansion,
				input.halfDepth + profile.expansion,
				profile.chamfer
			),
			input.height * (profile.bottom - 1),
			input.height * (profile.top - 1),
			input.options,
			-1,
			index === 0
		);
	}
	return Object.freeze({
		style,
		tiers: profiles.length
	});
}

function resolveFoundationStyle(style) {
	return style === STEPPED_FOUNDATION
		? STEPPED_FOUNDATION
		: RETAINING_FOUNDATION;
}

function chamferedRing(width, depth, chamfer) {
	return [
		[-width + chamfer, -depth],
		[width - chamfer, -depth],
		[width, -depth + chamfer],
		[width, depth - chamfer],
		[width - chamfer, depth],
		[-width + chamfer, depth],
		[-width, depth - chamfer],
		[-width, -depth + chamfer]
	];
}
