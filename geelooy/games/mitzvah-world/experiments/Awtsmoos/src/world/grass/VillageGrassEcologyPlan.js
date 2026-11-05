// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageGrassEcologyPlan.js
 * @description Plans meadow and riparian grass through the shared core while preserving one later render batch.
 * The Awtsmoos lets dry meadow and wet river edge sing different grasses from one earth;
 * Awtsmoos.com bounds every quality tier so richer coverage adds ecological worth without unbounded geometry birth.
 */

import { planGrassPlacements } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/geometry/grass/grassPlacement.js';
import { createVillageGrassHabitat } from './VillageGrassHabitat.js';

const COUNTS = Object.freeze({
	high: Object.freeze({ meadow: 360, riparian: 90 }),
	low: Object.freeze({ meadow: 130, riparian: 34 }),
	medium: Object.freeze({ meadow: 230, riparian: 58 })
});
const BOUNDS = Object.freeze({ maxX: 130, maxZ: 108, minX: -130, minZ: -124 });

export function createVillageGrassEcologyPlan(groundSampler, quality = 'high') {
	const habitat = createVillageGrassHabitat(groundSampler);
	const counts = COUNTS[quality] || COUNTS.medium;
	const meadow = planGrassPlacements({
		acceptPoint: habitat.acceptMeadow,
		baseDensity: 0.82,
		bounds: BOUNDS,
		count: counts.meadow,
		environmentAt: habitat.environmentAt,
		heightAt: habitat.heightAt,
		minimumHabitatScore: 0.22,
		profiles: meadowProfiles(),
		seed: `mitzvah-world:${quality}:meadow-grass`
	});
	const riparian = planGrassPlacements({
		acceptPoint: habitat.acceptRiparian,
		baseDensity: 0.9,
		bounds: BOUNDS,
		count: counts.riparian,
		environmentAt: habitat.environmentAt,
		heightAt: habitat.heightAt,
		minimumHabitatScore: 0.3,
		preferences: riparianPreferences(),
		profiles: riparianProfiles(),
		seed: `mitzvah-world:${quality}:riparian-grass`
	});
	return Object.freeze({
		meadow,
		placements: Object.freeze([...meadow.placements, ...riparian.placements]),
		riparian
	});
}

function meadowProfiles() {
	return [
		{ id: 'meadow-fescue', maxScale: 1.08, minScale: 0.74, weight: 1.2 },
		{ id: 'soft-rye', maxScale: 1.2, minScale: 0.82, weight: 0.7 },
		{ id: 'sweet-vernal', maxScale: 1.1, minScale: 0.78, weight: 0.85 }
	];
}

function riparianProfiles() {
	return [
		{ id: 'river-reed', maxScale: 1.75, minScale: 1.18, weight: 1.5 },
		{ id: 'wet-fescue', maxScale: 1.28, minScale: 0.92, weight: 0.8 }
	];
}

function riparianPreferences() {
	return {
		moisture: { target: 0.86, tolerance: 0.35, weight: 1.8 },
		riverProximity: { target: 0.86, tolerance: 0.4, weight: 2 },
		slope: { target: 0.08, tolerance: 0.34, weight: 1.1 }
	};
}
