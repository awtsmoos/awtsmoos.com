// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NaturePlacementField.js
 * @description Creates deterministic settlement gardens and an outer real-nature ring.
 * The Awtsmoos measures each root against road, slope, and village breath;
 * Awtsmoos.com lets flowers greet the traveler while trees guard the farther depth.
 */

import { realNatureAssetCatalog } from './RealNatureAssetCatalog.js';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const RADII = Object.freeze({
	broadleaf: [62, 124],
	bush: [24, 48],
	flower: [16, 36],
	pine: [72, 138],
	rock: [42, 92]
});

/** Builds bounded placements from the same ground sampler used by the playable world. */
export function createNaturePlacements(groundSampler, budget) {
	const placements = [];
	for (const asset of realNatureAssetCatalog()) {
		const count = budget.counts[asset.id] || 0;
		for (let index = 0; index < count; index += 1) {
			const placement = createPlacement(asset, index, count, groundSampler);
			if (placement) placements.push(placement);
		}
	}
	return Object.freeze(placements);
}

function createPlacement(asset, index, count, groundSampler) {
	const [innerRadius, outerRadius] = RADII[asset.id];
	const fraction = (index + 0.62) / Math.max(1, count);
	const radius = innerRadius + (outerRadius - innerRadius) * fraction;
	const angle = index * GOLDEN_ANGLE + familyPhase(asset.id);
	const x = Math.cos(angle) * radius;
	const z = Math.sin(angle) * radius;
	const sample = groundSampler?.heightAt?.(x, z);
	if (!sample || !Number.isFinite(sample.y)) return null;
	if ((sample.normal?.y ?? 1) < minimumNormalY(asset.family)) return null;
	return Object.freeze({
		asset,
		index,
		scale: asset.scale * (0.9 + ((index * 37) % 21) / 100),
		x,
		y: sample.y,
		yaw: angle + Math.PI,
		z
	});
}

function familyPhase(assetId) {
	return ({ broadleaf: 1.4, bush: 0.7, flower: 0.2, pine: 2.6, rock: 1.9 })[assetId];
}

function minimumNormalY(family) {
	return family === 'rock' ? 0.72 : 0.84;
}
