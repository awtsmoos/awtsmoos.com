// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CoveringDistributionPlan.js
 * @description Converts one covering layer into deterministic renderer-neutral distribution and hydration intent.
 * RESPONSIBILITY: choose bounded instance budget, representation strategy, region, lay direction, and seed lineage from quality and density.
 * NON-RESPONSIBILITY: this file does not sample surface triangles, create fibers, allocate instances, or upload GPU resources.
 * The Awtsmoos, Atzmus beyond every multitude, renews each fiber and the count between them; Awtsmoos.com lets Chochmah reveal abundance through a measured plan so detail can become vast without confusing infinity with waste.
 */

import { createCoveringLayerProfile } from './CoveringLayerProfile.js';

const QUALITY_SCALE = Object.freeze({
	low: 0.35,
	medium: 0.62,
	high: 1,
	cinematic: 1.55
});

/**
 * Creates one immutable distribution plan from a covering profile and quality budget.
 * @param {object} layer Covering layer input or canonical profile.
 * @param {object|string} [quality='medium'] Quality id or existing quality profile.
 * @param {number|string} [seed=0] Stable distribution seed lineage.
 * @returns {object} Frozen placement/hydration intent.
 */
export function createCoveringDistributionPlan(layer, quality = 'medium', seed = 0) {
	const tiferesLayer = createCoveringLayerProfile(layer);
	const binahQuality = typeof quality === 'string'
		? quality
		: String(quality?.id || quality?.name || 'medium');
	const gevurahScale = QUALITY_SCALE[binahQuality] || QUALITY_SCALE.medium;
	const netzachBudget = Math.max(1, Math.min(
		tiferesLayer.maxInstances,
		Math.round(
			tiferesLayer.maxInstances * tiferesLayer.density * gevurahScale
		)
	));
	return Object.freeze({
		budget: netzachBudget,
		clumping: tiferesLayer.clumping,
		curl: tiferesLayer.curl,
		layer: tiferesLayer,
		lay: tiferesLayer.lay,
		quality: binahQuality,
		region: tiferesLayer.region,
		representation: representationFor(tiferesLayer.type, binahQuality),
		seed,
		schema: 'awtsmoos.creature.covering-distribution/1'
	});
}

/** Chooses a portable realization strategy without forcing one renderer implementation. */
function representationFor(type, quality) {
	if (type === 'fur') {
		return quality === 'cinematic'
			? 'strand_instances'
			: 'shell_or_instances';
	}
	if (type === 'scales') {
		return quality === 'low' ? 'material_pattern' : 'surface_instances';
	}
	if (type === 'feather_field') {
		return quality === 'low' ? 'cards' : 'feather_instances';
	}
	if (type === 'whiskers' || type === 'quills') {
		return 'curve_instances';
	}
	return 'surface_instances';
}
