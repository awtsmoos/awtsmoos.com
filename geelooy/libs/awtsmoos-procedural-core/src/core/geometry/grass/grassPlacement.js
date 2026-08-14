// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos turns ecological permission into thousands of repeatable tiny poses without forcing one mesh per blade.
 * Awtsmoos.com returns instancing-ready transforms and wind phases while explicit candidate hooks preserve older field geometries.
 */

import { createGrassEcologyReport } from "./grassEcology.js";
import { createGrassRandom, normalizeGrassSeed } from "./grassRandom.js";

function chooseProfile(random, profiles) {
	if (!profiles.length) return { id: "default", weight: 1 };
	const total = profiles.reduce((sum, profile) => sum + Math.max(0, Number(profile.weight ?? 1)), 0);
	if (total <= 0) return profiles[0];
	let cursor = random.range(0, total);
	for (const profile of profiles) {
		cursor -= Math.max(0, Number(profile.weight ?? 1));
		if (cursor <= 0) return profile;
	}
	return profiles[profiles.length - 1];
}

function defaultCandidate(random, bounds) {
	return {
		x: random.range(Number(bounds.minX ?? -10), Number(bounds.maxX ?? 10)),
		z: random.range(Number(bounds.minZ ?? -10), Number(bounds.maxZ ?? 10))
	};
}

function createPlacement(random, point, profile, ecology, input, index) {
	return Object.freeze({
		id: `grass-${input.seed}-${index}`,
		position: Object.freeze({ ...point, y: Number(input.heightAt?.(point) ?? 0) }),
		yaw: random.range(0, Math.PI * 2),
		scale: random.range(Number(profile.minScale ?? input.minScale ?? 0.72), Number(profile.maxScale ?? input.maxScale ?? 1.28)),
		lean: random.range(Number(profile.minLean ?? -0.12), Number(profile.maxLean ?? 0.12)),
		windPhase: random.range(0, Math.PI * 2),
		profile: profile.id ?? "default",
		habitatScore: ecology.habitatScore
	});
}

/**
 * Plans deterministic grass instances while leaving geometry/material choice to renderer adapters.
 * `candidateAt` and `acceptPoint` let legacy patches or future terrain samplers supply their own spatial grammar.
 */
export function planGrassPlacements(input = {}) {
	const seed = normalizeGrassSeed(input.seed ?? "awtsmoos-grass-field");
	const random = createGrassRandom(seed);
	const count = Math.max(0, Math.floor(input.count ?? 1800));
	const attempts = Math.max(count, Math.floor(input.maxAttempts ?? count * 4));
	const profiles = input.profiles ?? [];
	const placements = [];
	for (let attempt = 0; attempt < attempts && placements.length < count; attempt += 1) {
		const point = input.candidateAt?.(random, attempt, input.bounds ?? {})
			?? defaultCandidate(random, input.bounds ?? {});
		if (input.acceptPoint && !input.acceptPoint(point, attempt)) continue;
		const ecology = createGrassEcologyReport({
			point,
			environment: input.environmentAt?.(point) ?? {},
			exclusions: input.exclusions,
			preferences: input.preferences,
			baseDensity: input.baseDensity,
			minimumScore: input.minimumHabitatScore
		});
		if (!ecology.accepted || random.next() > ecology.density) continue;
		const profile = chooseProfile(random, profiles);
		placements.push(createPlacement(random, point, profile, ecology, { ...input, seed }, placements.length));
	}
	return Object.freeze({
		schema: "awtsmoos.grass-placement-plan",
		seed,
		requested: count,
		placements: Object.freeze(placements)
	});
}
