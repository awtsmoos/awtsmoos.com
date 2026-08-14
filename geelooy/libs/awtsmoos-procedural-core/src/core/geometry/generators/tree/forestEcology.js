// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets every cedar answer the slope, river, light, and neighboring life before it grows.
 * Awtsmoos.com turns ecology into explicit numbers, so a forest is composed by habitat rather than random rows.
 */

function clamp01(value) {
	return Math.max(0, Math.min(1, Number(value ?? 0)));
}

function preference(value, target, tolerance) {
	const safeTolerance = Math.max(0.0001, Number(tolerance ?? 1));
	return clamp01(1 - Math.abs(Number(value ?? 0) - Number(target ?? 0)) / safeTolerance);
}

function distanceToExclusion(point, exclusion = {}) {
	const radius = Math.max(0, Number(exclusion.radius ?? 0));
	const distance = Math.hypot(
		Number(point.x ?? 0) - Number(exclusion.x ?? 0),
		Number(point.z ?? 0) - Number(exclusion.z ?? 0)
	);
	return distance - radius;
}

/** Returns whether a candidate point remains outside every circular ecological exclusion. */
export function isForestPointAllowed(point, exclusions = []) {
	return exclusions.every((exclusion) => distanceToExclusion(point, exclusion) >= 0);
}

/**
 * Scores a habitat from zero to one using explicit species preferences.
 * Missing environmental channels remain neutral instead of silently rejecting a site.
 */
export function scoreForestHabitat(environment = {}, preferences = {}) {
	const channels = [
		["moisture", 0.58, 0.58],
		["light", 0.66, 0.66],
		["slope", 0.22, 0.42],
		["altitude", 0.4, 0.72],
		["riverProximity", 0.44, 0.7],
		["disturbance", 0.08, 0.48]
	];
	let weightedTotal = 0;
	let totalWeight = 0;
	for (const [name, fallbackTarget, fallbackTolerance] of channels) {
		if (environment[name] == null) continue;
		const channel = preferences[name] ?? {};
		const weight = Math.max(0, Number(channel.weight ?? 1));
		const score = preference(
			environment[name],
			channel.target ?? fallbackTarget,
			channel.tolerance ?? fallbackTolerance
		);
		weightedTotal += score * weight;
		totalWeight += weight;
	}
	return totalWeight > 0 ? clamp01(weightedTotal / totalWeight) : 1;
}

/** Builds a serializable ecological report for creator APIs and runtime inspection. */
export function createForestEcologyReport(input = {}) {
	const allowed = isForestPointAllowed(input.point ?? {}, input.exclusions ?? []);
	const habitatScore = allowed
		? scoreForestHabitat(input.environment, input.preferences)
		: 0;
	return Object.freeze({
		schema: "awtsmoos.forest-ecology-report",
		allowed,
		habitatScore,
		accepted: allowed && habitatScore >= Number(input.minimumScore ?? 0.25)
	});
}
