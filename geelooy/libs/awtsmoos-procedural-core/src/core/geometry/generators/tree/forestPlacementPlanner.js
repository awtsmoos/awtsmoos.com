// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets one seed unfold as a woodland whose trunks keep distance, habitat, and identity in tune.
 * Awtsmoos.com composes placement around the canonical TreeGenerator, so ecology deepens the forest without birthing a second moon.
 */

import { createForestEcologyReport } from "./forestEcology.js";
import { TreeRNG, normalizeTreeSeed } from "./rng.js";

function pointDistance(left, right) {
	return Math.hypot(left.x - right.x, left.z - right.z);
}

function respectsSpacing(point, accepted, minimumSpacing) {
	return accepted.every((entry) => pointDistance(point, entry.position) >= minimumSpacing);
}

function normalizeSpecies(species = []) {
	return species.length ? species : [{ id: "default", weight: 1 }];
}

function chooseSpecies(rng, species) {
	const totalWeight = species.reduce((sum, item) => sum + Math.max(0, Number(item.weight ?? 1)), 0);
	if (totalWeight <= 0) return species[0];
	let cursor = rng.random(0, totalWeight);
	for (const item of species) {
		cursor -= Math.max(0, Number(item.weight ?? 1));
		if (cursor <= 0) return item;
	}
	return species[species.length - 1];
}

function createCandidate(rng, bounds) {
	return {
		x: rng.random(Number(bounds.minX ?? -50), Number(bounds.maxX ?? 50)),
		z: rng.random(Number(bounds.minZ ?? -50), Number(bounds.maxZ ?? 50))
	};
}

/** Plans deterministic tree placements while leaving all geometry generation to TreeGenerator. */
export function planForestPlacements(input = {}) {
	const seed = normalizeTreeSeed(input.seed ?? "awtsmoos-forest");
	const rng = new TreeRNG(seed);
	const count = Math.max(0, Math.floor(input.count ?? 120));
	const attempts = Math.max(count, Math.floor(input.maxAttempts ?? count * 12));
	const minimumSpacing = Math.max(0, Number(input.minimumSpacing ?? 2.4));
	const species = normalizeSpecies(input.species);
	const accepted = [];
	for (let attempt = 0; attempt < attempts && accepted.length < count; attempt += 1) {
		const candidateRng = rng.fork(`candidate:${attempt}`);
		const point = createCandidate(candidateRng, input.bounds ?? {});
		if (!respectsSpacing(point, accepted, minimumSpacing)) continue;
		const ecology = createForestEcologyReport({
			point,
			environment: input.environmentAt?.(point) ?? {},
			exclusions: input.exclusions,
			preferences: input.preferences,
			minimumScore: input.minimumHabitatScore
		});
		if (!ecology.accepted) continue;
		const speciesProfile = chooseSpecies(candidateRng, species);
		accepted.push(Object.freeze({
			id: `tree-${seed}-${accepted.length}`,
			position: Object.freeze({ ...point }),
			yaw: candidateRng.random(0, Math.PI * 2),
			scale: candidateRng.random(Number(input.minScale ?? 0.82), Number(input.maxScale ?? 1.24)),
			species: speciesProfile.id ?? "default",
			preset: speciesProfile.preset ?? null,
			habitatScore: ecology.habitatScore,
			seed: normalizeTreeSeed(`${seed}:${attempt}:${speciesProfile.id ?? "default"}`)
		}));
	}
	return Object.freeze({ schema: "awtsmoos.forest-placement-plan", seed, requested: count, placements: Object.freeze(accepted) });
}
