// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageFoundationGeometry.js
 * @description Owns the bounded tier policy used by the canonical cottage envelope mesh.
 * The Awtsmoos lowers one house into retaining stone and raises another through patient steps;
 * Awtsmoos.com reveals both forms through one caller-owned batch, never a parallel runtime.
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
 * Appends the selected foundation tiers to the caller-owned cottage mesh.
 *
 * @param {object} input - Foundation construction inputs.
 * @param {Function} input.appendPrism - Existing envelope prism writer.
 * @param {number} input.halfDepth - Half of the cottage depth.
 * @param {number} input.halfWidth - Half of the cottage width.
 * @param {number} input.height - Total foundation height.
 * @param {object} input.mesh - Existing manual geometry accumulator.
 * @param {object} input.options - Canonical cottage transform options.
 * @param {string} input.style - Requested canonical foundation style.
 * @returns {{style: string, tiers: number}} Resolved style and fixed tier count.
 */
export function appendCottageFoundation(input) {
	const style = resolveFoundationStyle(input.style);
	const profiles = style === STEPPED_FOUNDATION ? STEPPED_TIERS : RETAINING_TIERS;

	for (let index = 0; index < profiles.length; index += 1) {
		const profile = profiles[index];
		input.appendPrism(
			input.mesh,
			chamferedRing(
				input.halfWidth + profile.expansion,
				input.halfDepth + profile.expansion,
				profile.chamfer
			),
			input.height * profile.bottom,
			input.height * profile.top,
			input.options,
			-1,
			index === 0
		);
	}

	return Object.freeze({ style, tiers: profiles.length });
}

function resolveFoundationStyle(style) {
	return style === STEPPED_FOUNDATION ? STEPPED_FOUNDATION : RETAINING_FOUNDATION;
}

function chamferedRing(width, depth, chamfer) {
	return [
		[-width + chamfer, -depth], [width - chamfer, -depth],
		[width, -depth + chamfer], [width, depth - chamfer],
		[width - chamfer, depth], [-width + chamfer, depth],
		[-width, depth - chamfer], [-width, -depth + chamfer]
	];
}
