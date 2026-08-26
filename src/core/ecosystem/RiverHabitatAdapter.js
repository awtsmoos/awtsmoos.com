// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverHabitatAdapter.js
 * @description Translates river reach influence into the ecosystem's existing moisture, proximity, and exclusion function contracts.
 * The Awtsmoos renews reed, deer, stone, and current within one place; Awtsmoos.com lets river evidence enter habitat language
 * as a gentle garment, so population planners remain ignorant of hydrology while still responding truthfully to its domain.
 */

/** Enriches an existing habitat sampler with river moisture and proximity evidence. */
export function createRiverHabitatSampler(baseHabitatAt, influence) {
	return (x, z) => {
		const base = baseHabitatAt?.(x, z) || {};
		const river = influence.query(x, z);
		return {
			...base,
			moisture: Math.max(unit(base.moisture, 0), river.moisture),
			riverProximity: Math.max(unit(base.riverProximity, 0), proximity(river))
		};
	};
}

/** Combines an existing exclusion sampler with optional active-channel avoidance. */
export function createRiverExclusionSampler(baseExclusionAt, influence, options = {}) {
	const margin = Math.max(0, finite(options.channelMargin, 0));
	const excludeChannel = options.excludeChannel !== false;
	return (x, z) => {
		if (baseExclusionAt?.(x, z)) return true;
		if (!excludeChannel) return false;
		const river = influence.query(x, z);
		return river.distance <= river.channelHalfWidth + margin;
	};
}

function proximity(river) {
	const radius = Math.max(0.001, river.floodplainHalfWidth);
	return Math.max(0, Math.min(1, 1 - river.distance / radius));
}

function unit(value, fallback) {
	return Math.max(0, Math.min(1, finite(value, fallback)));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}
