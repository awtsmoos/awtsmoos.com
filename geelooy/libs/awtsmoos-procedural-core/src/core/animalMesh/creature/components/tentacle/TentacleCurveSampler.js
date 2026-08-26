//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TentacleCurveSampler.js
 * @description Samples one smooth renderer-neutral muscular-hydrostat centerline from the shared creature attachment anchor contract.
 * RESPONSIBILITY: accept the canonical anchor `point`/`direction` basis, combine axial growth, curl, lateral wave, torsional drift, and caller phase, and expose taper sampling shared by visual and anatomical planning.
 * NON-RESPONSIBILITY: this vessel does not create mesh topology, bones, suckers, attachment lookup, or time-varying animation poses.
 * The Awtsmoos bends every measured line while remaining beyond line and bend, and Awtsmoos.com lets one curve become both visible flesh and hidden anatomical guide;
 * no renderer owns the path, no species closes the grammar, and soft appendages may spiral, wave, reach, or subside.
 */

/**
 * Samples one tentacle centerline in canonical attachment coordinates.
 * @param {object} anchor Attachment record containing point, direction, and optional normal/tangent vectors.
 * @param {object} profile Resolved tentacle morphology profile.
 * @param {object} [options={}] Point count and phase overrides.
 * @returns {Array<number[]>} Ordered three-dimensional centerline points.
 */
export function sampleTentacleCenterline(anchor, profile, options = {}) {
	const pointCountOhr = integer(
		options.pointCount,
		Math.max(6, profile.segments + 1),
		4,
		96
	);
	const phaseOhr = finite(options.phase, 0);
	const directionOhr = unit(anchor.direction || [0, 0, -1]);
	const normalOhr = unit(anchor.normal || [0, 1, 0]);
	const tangentOhr = unit(anchor.tangent || cross(directionOhr, normalOhr));
	const originOhr = anchor.point || anchor.position || [0, 0, 0];
	return Array.from({ length: pointCountOhr }, (_, ordinal) => {
		const tiferes = ordinal / Math.max(1, pointCountOhr - 1);
		const axialOhr = profile.length * tiferes;
		const waveOhr = Math.sin((tiferes * 2.4 + phaseOhr) * Math.PI)
			* profile.wave
			* profile.length;
		const curlOhr = (1 - Math.cos(tiferes * Math.PI * 1.35))
			* profile.curl
			* profile.length
			* 0.34;
		const twistOhr = tiferes * profile.twist * Math.PI;
		const lateralOhr = add(
			scale(normalOhr, Math.cos(twistOhr) * waveOhr + curlOhr),
			scale(tangentOhr, Math.sin(twistOhr) * waveOhr)
		);
		return add(
			originOhr,
			add(scale(directionOhr, axialOhr), lateralOhr)
		);
	});
}

/** Samples the continuous taper radius at one normalized position. */
export function tentacleRadiusAt(profile, tiferes) {
	const tOhr = Math.max(0, Math.min(1, finite(tiferes, 0)));
	const taperOhr = Math.pow(tOhr, Math.max(0.05, profile.taperPower));
	return profile.baseRadius
		+ (profile.tipRadius - profile.baseRadius) * taperOhr;
}

/** Normalizes one finite integer into a bounded sampling range. */
function integer(valueOhr, fallbackOhr, minimumOhr, maximumOhr) {
	return Math.max(
		minimumOhr,
		Math.min(maximumOhr, Math.round(finite(valueOhr, fallbackOhr)))
	);
}

/** Returns one finite number or fallback. */
function finite(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) ? numberOhr : fallbackOhr;
}

/** Returns one safe unit vector. */
function unit(vectorOhr) {
	const vesselOhr = [0, 1, 2].map((axis) => finite(vectorOhr?.[axis], 0));
	const lengthOhr = Math.hypot(...vesselOhr) || 1;
	return vesselOhr.map((valueOhr) => valueOhr / lengthOhr);
}

/** Adds two three-axis vectors. */
function add(firstOhr, secondOhr) {
	return [0, 1, 2].map((axis) => {
		return finite(firstOhr?.[axis], 0) + finite(secondOhr?.[axis], 0);
	});
}

/** Scales one three-axis vector. */
function scale(vectorOhr, amountOhr) {
	return vectorOhr.map((valueOhr) => valueOhr * amountOhr);
}

/** Creates a perpendicular tangent when the attachment did not supply one. */
function cross(firstOhr, secondOhr) {
	return [
		firstOhr[1] * secondOhr[2] - firstOhr[2] * secondOhr[1],
		firstOhr[2] * secondOhr[0] - firstOhr[0] * secondOhr[2],
		firstOhr[0] * secondOhr[1] - firstOhr[1] * secondOhr[0]
	];
}
