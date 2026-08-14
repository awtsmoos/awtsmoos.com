// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos lets a whole woodland travel as structured intention before one polygon is grown.
 * Awtsmoos.com keeps ecology, exclusions, LOD, and canonical-tree authority explicit so every adapter knows the throne.
 */

import { normalizeTreeSeed } from "./rng.js";

function freezeArray(values = []) {
	return Object.freeze(values.map((value) => Object.freeze({ ...value })));
}

function normalizeBounds(bounds = {}) {
	return Object.freeze({
		minX: Number(bounds.minX ?? -50),
		maxX: Number(bounds.maxX ?? 50),
		minZ: Number(bounds.minZ ?? -50),
		maxZ: Number(bounds.maxZ ?? 50)
	});
}

/** Creates a serialization-safe forest contract for the universal Creator API. */
export function createForestCreatorDescriptor(input = {}) {
	const count = Math.max(0, Math.floor(input.count ?? 120));
	return Object.freeze({
		schema: "awtsmoos.forest-creator",
		version: 1,
		generator: "canonical-tree-generator",
		seed: normalizeTreeSeed(input.seed ?? "awtsmoos-forest"),
		count,
		bounds: normalizeBounds(input.bounds),
		minimumSpacing: Math.max(0, Number(input.minimumSpacing ?? 2.4)),
		minimumHabitatScore: Math.max(0, Math.min(1, Number(input.minimumHabitatScore ?? 0.25))),
		minScale: Number(input.minScale ?? 0.82),
		maxScale: Number(input.maxScale ?? 1.24),
		species: freezeArray(input.species?.length ? input.species : [{ id: "default", weight: 1 }]),
		exclusions: freezeArray(input.exclusions),
		preferences: Object.freeze({ ...(input.preferences ?? {}) }),
		runtime: Object.freeze({
			lodDistances: Object.freeze([...(input.runtime?.lodDistances ?? [35, 75, 135])]),
			shadowDistance: Number(input.runtime?.shadowDistance ?? 75),
			collisionDistance: Number(input.runtime?.collisionDistance ?? 28),
			windResponse: Math.max(0, Number(input.runtime?.windResponse ?? 1))
		}),
		capabilities: Object.freeze({ ecology: true, exclusions: true, deterministicPlacement: true, canonicalGeometry: true })
	});
}
