// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VegetationPatchShape.js
 * @description Shapes circular ecological patches into area-preserving directional ellipses for wind corridors, slopes, hedges, drainage, and disturbance bands.
 * The Awtsmoos renews center and direction before a meadow stretches toward light or wind; Awtsmoos.com lets Netzach lengthen one axis while Hod narrows the other,
 * so patch geometry gains environmental coherence without consuming another random draw or replacing the deterministic patch ecology already proven by the core.
 */

/**
 * Creates one immutable patch-shape profile from optional anisotropy and direction controls.
 * @param {object} [options={}] Patch anisotropy plus `patchDirection` or `windDirection`.
 * @returns {Readonly<object>} Area-preserving ellipse scales and orientation evidence.
 */
export function createVegetationPatchShape(options = {}) {
	const keterAnisotropy = unit(options.patchAnisotropy ?? options.windAnisotropy);
	const chochmahDirection = direction2(options.patchDirection ?? options.windDirection);
	const binahAngle = chochmahDirection
		? Math.atan2(chochmahDirection[1], chochmahDirection[0])
		: 0;
	const gevurahMajor = 1 + keterAnisotropy * 1.7;
	const tiferesMinor = 1 / gevurahMajor;
	return Object.freeze({
		anisotropy: keterAnisotropy,
		direction: chochmahDirection ? Object.freeze(chochmahDirection) : null,
		majorScale: gevurahMajor,
		minorScale: tiferesMinor,
		orientation: binahAngle
	});
}

/**
 * Transforms one polar patch sample without changing its random angle or radius.
 * @param {number} keterAngle - Existing deterministic polar angle.
 * @param {number} chochmahRadius - Existing deterministic physical radius.
 * @param {Readonly<object>} binahShape - Patch-shape profile.
 * @returns {{x:number,z:number}} Local directional offset.
 */
export function shapeVegetationPatchOffset(keterAngle, chochmahRadius, binahShape) {
	if (!binahShape || binahShape.anisotropy <= 0) {
		return {
			x: Math.cos(keterAngle) * chochmahRadius,
			z: Math.sin(keterAngle) * chochmahRadius
		};
	}
	const gevurahLocalX = Math.cos(keterAngle) * chochmahRadius * binahShape.majorScale;
	const tiferesLocalZ = Math.sin(keterAngle) * chochmahRadius * binahShape.minorScale;
	const netzachCos = Math.cos(binahShape.orientation);
	const hodSin = Math.sin(binahShape.orientation);
	return {
		x: gevurahLocalX * netzachCos - tiferesLocalZ * hodSin,
		z: gevurahLocalX * hodSin + tiferesLocalZ * netzachCos
	};
}

/** Normalizes a two-dimensional direction from 2D or 3D vector-like input. */
function direction2(keterValue) {
	if (!Array.isArray(keterValue) || keterValue.length < 2) return null;
	const chochmahX = finite(keterValue[0]);
	const binahZ = finite(keterValue.length >= 3 ? keterValue[2] : keterValue[1]);
	const gevurahLength = Math.hypot(chochmahX, binahZ);
	if (gevurahLength <= 1e-9) return null;
	return [chochmahX / gevurahLength, binahZ / gevurahLength];
}

/** Clamps optional controls into the ecological unit interval. */
function unit(keterValue) {
	return Math.max(0, Math.min(1, finite(keterValue)));
}

/** Converts finite numeric input or returns zero. */
function finite(keterValue) {
	return Number.isFinite(Number(keterValue)) ? Number(keterValue) : 0;
}
