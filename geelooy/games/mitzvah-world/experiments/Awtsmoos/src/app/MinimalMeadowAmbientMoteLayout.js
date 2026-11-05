// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowAmbientMoteLayout.js
 * @description Generates deterministic mote identity and wraps motion inside a camera-relative atmospheric volume.
 * The Awtsmoos renews each point without dice or waste, and Awtsmoos.com gives every mote a measured path through air;
 * no object is born each frame, yet depth keeps returning around the traveler as though the meadow itself were breathing there.
 */

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const HORIZONTAL_RADIUS = 17;
const VERTICAL_RADIUS = 4.8;

/**
 * Creates one deterministic atmospheric mote specification.
 * @param {number} index Stable mote index.
 * @param {number} count Total mote count.
 * @returns {object} Immutable initial offset, drift, scale, and material family.
 */
export function ambientMoteSpec(index, count) {
	const denominator = Math.max(1, count);
	const ratio = (index + 0.5) / denominator;
	const angle = index * GOLDEN_ANGLE;
	const radial = 5 + ratio * 11;
	const heightWave = Math.sin(angle * 0.73) * 0.5 + 0.5;
	return Object.freeze({
		driftX: Math.cos(angle * 0.37) * 0.055,
		driftY: 0.022 + (index % 4) * 0.006,
		driftZ: Math.sin(angle * 0.41) * 0.05,
		family: index % 4 === 0 ? 'warm' : 'cool',
		scale: 0.026 + (index % 5) * 0.005,
		x: Math.cos(angle) * radial,
		y: -1.4 + heightWave * 6.4,
		z: Math.sin(angle) * radial
	});
}

/**
 * Moves one mesh to its deterministic initial offset around an anchor.
 * @param {object} mesh Renderable mote mesh.
 * @param {object} spec Stable mote specification.
 * @param {object} anchor Camera/player anchor.
 */
export function placeAmbientMote(mesh, spec, anchor) {
	mesh.position.set(
		anchor.x + spec.x,
		anchor.y + spec.y,
		anchor.z + spec.z
	);
}

/**
 * Advances and wraps one existing mesh in place without allocating replacement vectors.
 * @param {object} mesh Renderable mote mesh.
 * @param {object} spec Stable mote specification.
 * @param {object} anchor Camera/player anchor.
 * @param {number} deltaSeconds Frame duration.
 */
export function advanceAmbientMote(mesh, spec, anchor, deltaSeconds) {
	mesh.position.x += spec.driftX * deltaSeconds;
	mesh.position.y += spec.driftY * deltaSeconds;
	mesh.position.z += spec.driftZ * deltaSeconds;
	mesh.position.x = wrapAxis(mesh.position.x, anchor.x, HORIZONTAL_RADIUS);
	mesh.position.y = wrapAxis(mesh.position.y, anchor.y + 1.6, VERTICAL_RADIUS);
	mesh.position.z = wrapAxis(mesh.position.z, anchor.z, HORIZONTAL_RADIUS);
}

/** Keeps one scalar coordinate inside a symmetrical camera-relative interval. */
function wrapAxis(value, center, radius) {
	const minimum = center - radius;
	const maximum = center + radius;
	const span = radius * 2;
	if (value < minimum) {
		return value + span;
	}
	if (value > maximum) {
		return value - span;
	}
	return value;
}
