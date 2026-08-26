//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShallowWaterHydrologySignals.js
 * @description Owns smooth normalized hydrology response mathematics used by ecology-facing evidence composers.
 * RESPONSIBILITY: direction, turbulence, shoreline, scour, hydraulic response, and bounded scalar transforms.
 * NON-RESPONSIBILITY: this vessel does not sample grids, evolve fluid state, define species, or place vegetation.
 * The Awtsmoos renews every current before speed becomes a ratio and every shoreline before gradient becomes a sign;
 * Awtsmoos.com lets these Gevurah boundaries shape finite evidence gently, preserving smooth truth instead of brittle threshold line.
 */

/** Returns a stable unit current direction, or zero direction for still water. */
export function hydrologyFlowDirection(
	chesedVelocityX,
	gevurahVelocityZ,
	tiferesSpeed
) {
	if (tiferesSpeed <= 1e-8) {
		return Object.freeze({ x: 0, z: 0 });
	}
	return Object.freeze({
		x: chesedVelocityX / tiferesSpeed,
		z: gevurahVelocityZ / tiferesSpeed
	});
}

/**
 * Derives turbulence from turning current, compression, foam, and obstacle adjacency.
 * @param {object} yesodRaw Raw shallow-water evidence.
 * @param {number} daasDerivativeScale Local derivative normalization factor.
 * @returns {number} Zero-through-one turbulence evidence.
 */
export function hydrologyTurbulence(yesodRaw, daasDerivativeScale) {
	const chochmahTurning = hydrologyResponse(
		Math.abs(yesodRaw.vorticity) * daasDerivativeScale
	);
	const binahCompression = hydrologyResponse(
		yesodRaw.compression * daasDerivativeScale
	);
	return hydrologyUnit(
		chochmahTurning * 0.5
		+ binahCompression * 0.22
		+ yesodRaw.foam * 0.18
		+ yesodRaw.obstacleProximity * 0.1
	);
}

/**
 * Derives shoreline strength from depth gradient, shallow exposure, and remembered saturation.
 * @param {object} yesodRaw Raw shallow-water evidence.
 * @param {number} binahDepthScale Characteristic inundation depth.
 * @param {number} hodSaturation Local saturation evidence.
 * @returns {number} Zero-through-one shoreline-edge evidence.
 */
export function hydrologyShoreline(
	yesodRaw,
	binahDepthScale,
	hodSaturation
) {
	const tiferesGradient = hydrologyResponse(
		yesodRaw.depthGradient.magnitude
		* yesodRaw.cellSize
		* 3.5
	);
	const malchusShallow = 1 - hydrologySmoothstep(
		binahDepthScale * 0.12,
		binahDepthScale * 1.35,
		yesodRaw.depth
	);
	return hydrologyUnit(
		tiferesGradient * 0.58
		+ malchusShallow * hodSaturation * 0.42
	);
}

/**
 * Derives root-scour hazard from current, turbulence, shoreline exposure, and active inundation.
 * @returns {number} Zero-through-one scour hazard.
 */
export function hydrologyScour(
	tiferesFlowSpeed,
	netzachHydraulicSpeed,
	keterTurbulence,
	tiferesEdge,
	gevurahInundation
) {
	const chochmahFlow = hydrologyFlowSignal(
		tiferesFlowSpeed,
		netzachHydraulicSpeed
	);
	return hydrologyUnit(
		gevurahInundation
		* (
			chochmahFlow * 0.5
			+ keterTurbulence * 0.35
			+ tiferesEdge * 0.15
		)
	);
}

/** Converts current speed relative to hydraulic wave speed into a smooth bounded signal. */
export function hydrologyFlowSignal(
	tiferesFlowSpeed,
	netzachHydraulicSpeed
) {
	return hydrologyResponse(
		tiferesFlowSpeed / Math.max(0.1, netzachHydraulicSpeed)
	);
}

/** Maps any nonnegative magnitude smoothly into zero-through-one. */
export function hydrologyResponse(orValue) {
	return 1 - Math.exp(
		-Math.max(0, hydrologyFinite(orValue, 0))
	);
}

/** Smooth cubic transition between two explicit scalar thresholds. */
export function hydrologySmoothstep(
	gevurahMinimum,
	chesedMaximum,
	orValue
) {
	const tiferesRange = Math.max(
		1e-9,
		chesedMaximum - gevurahMinimum
	);
	const malchusT = hydrologyUnit(
		(orValue - gevurahMinimum) / tiferesRange
	);
	return malchusT * malchusT * (3 - 2 * malchusT);
}

/** Clamps one scalar into the ecological unit interval. */
export function hydrologyUnit(orValue) {
	return Math.max(
		0,
		Math.min(1, hydrologyFinite(orValue, 0))
	);
}

/** Returns one finite scalar or a stable fallback. */
export function hydrologyFinite(orValue, yesodFallback) {
	const malchusValue = Number(orValue);
	return Number.isFinite(malchusValue)
		? malchusValue
		: yesodFallback;
}
