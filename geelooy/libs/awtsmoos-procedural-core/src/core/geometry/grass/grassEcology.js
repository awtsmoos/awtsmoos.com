// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets every blade answer moisture, light, slope, disturbance, and nearby paths before it appears.
 * Awtsmoos.com turns ecological fitness into a small pure contract, so rich grass can grow by habitat instead of uniform spheres.
 */

function clamp01(value) {
	return Math.max(0, Math.min(1, Number(value ?? 0)));
}

function preference(value, target, tolerance) {
	const safeTolerance = Math.max(0.0001, Number(tolerance ?? 1));
	return clamp01(1 - Math.abs(Number(value ?? 0) - Number(target ?? 0)) / safeTolerance);
}

function exclusionDistance(point, exclusion) {
	const radius = Math.max(0, Number(exclusion.radius ?? 0));
	return Math.hypot(point.x - Number(exclusion.x ?? 0), point.z - Number(exclusion.z ?? 0)) - radius;
}

/** Returns true when a blade candidate lies outside every path, house, tree, and water exclusion. */
export function isGrassPointAllowed(point, exclusions = []) {
	return exclusions.every((exclusion) => exclusionDistance(point, exclusion) >= 0);
}

/** Scores ecological fitness without assuming every caller provides every environmental channel. */
export function scoreGrassHabitat(environment = {}, preferences = {}) {
	const channels = [
		["moisture", 0.54, 0.62],
		["light", 0.72, 0.72],
		["slope", 0.15, 0.45],
		["soil", 0.62, 0.62],
		["disturbance", 0.12, 0.48],
		["riverProximity", 0.36, 0.72]
	];
	let total = 0;
	let weightTotal = 0;
	for (const [name, defaultTarget, defaultTolerance] of channels) {
		if (environment[name] == null) continue;
		const preferenceConfig = preferences[name] ?? {};
		const weight = Math.max(0, Number(preferenceConfig.weight ?? 1));
		total += preference(
			environment[name],
			preferenceConfig.target ?? defaultTarget,
			preferenceConfig.tolerance ?? defaultTolerance
		) * weight;
		weightTotal += weight;
	}
	return weightTotal > 0 ? clamp01(total / weightTotal) : 1;
}

/** Converts habitat fitness into a density probability with explicit minimum acceptance. */
export function createGrassEcologyReport(input = {}) {
	const allowed = isGrassPointAllowed(input.point ?? { x: 0, z: 0 }, input.exclusions ?? []);
	const habitatScore = allowed ? scoreGrassHabitat(input.environment, input.preferences) : 0;
	const density = clamp01(Number(input.baseDensity ?? 1) * habitatScore);
	return Object.freeze({
		schema: "awtsmoos.grass-ecology-report",
		allowed,
		habitatScore,
		density,
		accepted: allowed && habitatScore >= Number(input.minimumScore ?? 0.15)
	});
}
