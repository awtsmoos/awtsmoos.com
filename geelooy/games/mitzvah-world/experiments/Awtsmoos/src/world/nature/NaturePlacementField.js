// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NaturePlacementField.js
 * @description Places non-tree hero accents through the same house, stair, road, river, slope, and spacing truth as the forest.
 * The Awtsmoos lets blossom, bush, and stone gather in living irregularity without blocking a threshold or current;
 * Awtsmoos.com keeps all trees in the deep core while these finite accents search bounded sites around canonical terrain.
 */

import { ecologySiteEvidenceAt } from '../spatial/WorldEcologyClearance.js';
import { ecologySpacingClearance } from '../spatial/WorldEcologySpacing.js';
import { realNatureAssetCatalog } from './RealNatureAssetCatalog.js';

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const RADII = Object.freeze({
	bush: Object.freeze([22, 52]),
	flower: Object.freeze([16, 42]),
	rock: Object.freeze([34, 92])
});

export function createNaturePlacements(groundSampler, budget) {
	const placements = [];
	for (const asset of realNatureAssetCatalog()) {
		const count = budget.counts[asset.id] || 0;
		for (let index = 0; index < count; index += 1) {
			const placement = findPlacement(asset, index, count, groundSampler, placements);
			if (placement) placements.push(placement);
		}
	}
	return Object.freeze(placements);
}

function findPlacement(asset, index, count, groundSampler, occupied) {
	const radius = siteRadius(asset.family);
	for (let attempt = 0; attempt < 36; attempt += 1) {
		const point = candidate(asset, index, count, attempt);
		const ecology = ecologySiteEvidenceAt(point, {
			approachMargin: 0.5,
			clearingMargin: 0.15,
			groundSampler,
			minimumNormalY: minimumNormalY(asset.family),
			roadMargin: 0.35,
			siteRadius: radius,
			waterMargin: waterMargin(asset.family)
		});
		if (!ecology.valid) continue;
		const spacing = ecologySpacingClearance(point, radius, occupied);
		if (spacing < 0) continue;
		return Object.freeze({
			asset,
			ecology,
			index,
			scale: asset.scale * (0.88 + ((index * 37 + attempt * 11) % 25) / 100),
			siteRadius: radius,
			x: point.x,
			y: ecology.sample.y,
			yaw: point.angle + Math.PI,
			z: point.z
		});
	}
	return null;
}

function candidate(asset, index, count, attempt) {
	const [inner, outer] = RADII[asset.id];
	const fraction = (index + 0.54 + attempt * 0.173) / Math.max(1, count + attempt * 0.31);
	const radius = inner + (outer - inner) * (fraction % 1);
	const angle = (index + attempt * 0.47) * GOLDEN_ANGLE + familyPhase(asset.id);
	return { angle, x: Math.cos(angle) * radius, z: Math.sin(angle) * radius };
}

function familyPhase(assetId) {
	return ({ bush: 0.7, flower: 0.2, rock: 1.9 })[assetId];
}

function minimumNormalY(family) {
	return family === 'rock' ? 0.7 : 0.82;
}

function siteRadius(family) {
	return ({ bush: 0.95, flower: 0.42, rock: 1.15 })[family] || 0.5;
}

function waterMargin(family) {
	return family === 'rock' ? 0.1 : family === 'flower' ? 0.45 : 0.8;
}
