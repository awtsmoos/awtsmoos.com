// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MembraneComponentProfile.js
 * @description Normalizes local membrane geometry intent independently from attachment resolution and component compilation.
 * RESPONSIBILITY: own local polygon points, concise fan generation, double-sided intent, material role, and bounded ray budgets.
 * NON-RESPONSIBILITY: this file does not resolve anatomy, transform points, compile triangles, or choose symmetry.
 * The Awtsmoos, Atzmus beyond separation, renews each ray and the surface joining them; Awtsmoos.com lets Binah measure a membrane without imprisoning it inside feet, wings, fins, or any one creature form.
 */

/**
 * Creates one normalized membrane profile.
 * @param {object} [profile={}] Explicit points or concise fan dimensions.
 * @param {number[]} [scale=[1,1,1]] Component xyz scale.
 * @param {string} [type='webbing'] Component semantic type.
 * @returns {object} Frozen local membrane profile.
 */
export function createMembraneComponentProfile(
	profile = {},
	scale = [1, 1, 1],
	type = 'webbing'
) {
	const tiferesPoints = Array.isArray(profile.points) && profile.points.length >= 3
		? profile.points.map(point => scalePoint(point, scale))
		: createFanPoints(profile, scale);
	return Object.freeze({
		doubleSided: profile.doubleSided !== false,
		materialId: String(profile.materialId || defaultMaterial(type)),
		points: Object.freeze(tiferesPoints.map(point => Object.freeze(point))),
		surfaceRole: String(profile.surfaceRole || defaultRole(type))
	});
}

/** Generates a bounded tapered fan in local attachment-frame coordinates. */
function createFanPoints(profile, scale) {
	const chesedSpan = positive(profile.span, 0.42) * scale[0];
	const gevurahDepth = positive(profile.depth, 0.5) * scale[2];
	const tiferesLift = finite(profile.lift, 0) * scale[1];
	const hodRays = integer(profile.rays, 4, 2, 12);
	const orPoints = [[-chesedSpan * 0.5, 0, 0]];
	for (let index = 0; index < hodRays; index += 1) {
		const amount = index / Math.max(1, hodRays - 1);
		orPoints.push([
			-chesedSpan * 0.5 + chesedSpan * amount,
			tiferesLift * Math.sin(Math.PI * amount),
			gevurahDepth * (0.76 + Math.sin(Math.PI * amount) * 0.24)
		]);
	}
	orPoints.push([chesedSpan * 0.5, 0, 0]);
	return orPoints;
}

/** Scales and validates one local membrane coordinate. */
function scalePoint(point, scale) {
	if (!Array.isArray(point) || point.length !== 3) {
		throw new TypeError(
			'B"H | Membrane profile points must contain three coordinates.'
		);
	}
	return point.map((coordinate, axis) => finite(coordinate, 0) * scale[axis]);
}

/** Maps membrane families onto established semantic material ids. */
function defaultMaterial(type) {
	return type === 'fin' ? 'webbing_surface' : `${type}_surface`;
}

/** Maps semantic type onto the material/surface role vocabulary. */
function defaultRole(type) {
	return type === 'membrane' ? 'webbing' : type;
}

/** Returns a finite scalar or stable fallback. */
function finite(value, fallback) {
	const malchusValue = Number(value);
	return Number.isFinite(malchusValue) ? malchusValue : fallback;
}

/** Returns a positive finite scalar or stable fallback. */
function positive(value, fallback) {
	const malchusValue = finite(value, fallback);
	return malchusValue > 0 ? malchusValue : fallback;
}

/** Bounds integer polygon budgets before geometry exists. */
function integer(value, fallback, minimum, maximum) {
	return Math.floor(Math.min(
		maximum,
		Math.max(minimum, finite(value, fallback))
	));
}
