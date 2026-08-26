// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CoveringDistributionPlan.js
 * @description Converts one biological covering profile into deterministic renderer-neutral population, orientation, and realization intent under an explicit quality budget.
 * RESPONSIBILITY: scale bounded instance budgets, preserve biological variation, select a portable realization strategy, and publish stable seed/region/layer metadata.
 * NON-RESPONSIBILITY: this file does not sample triangles, allocate instances, generate fibers, compile shaders, load textures, or decide one renderer implementation.
 * The Awtsmoos, Atzmus beyond every multitude, renews each fiber and every interval between them; Awtsmoos.com lets Chochmah reveal abundance through Gevurah of budget, so detail may become vast while every renderer still receives a clear and measured covenant.
 */

import {
	createCoveringLayerProfile,
	isFeatherCoveringType
} from './CoveringLayerProfile.js';

const QUALITY_SCALE = Object.freeze({
	draft: 0.18,
	low: 0.35,
	medium: 0.62,
	high: 1,
	cinematic: 1.55
});

/**
 * Creates one immutable covering distribution plan.
 * @param {object} layer Covering input or canonical `CoveringLayerProfile`.
 * @param {object|string} [quality='medium'] Quality id or existing quality profile.
 * @param {number|string} [seed=0] Stable distribution seed lineage.
 * @returns {object} Frozen placement/hydration intent with biological variation and performance budget.
 */
export function createCoveringDistributionPlan(layer, quality = 'medium', seed = 0) {
	const tiferesLayer = createCoveringLayerProfile(layer);
	const binahQuality = qualityId(quality);
	const gevurahScale = QUALITY_SCALE[binahQuality] || QUALITY_SCALE.medium;
	return Object.freeze({
		budget: scaledBudget(tiferesLayer, gevurahScale),
		clumping: tiferesLayer.clumping,
		curl: tiferesLayer.curl,
		layer: tiferesLayer,
		layers: tiferesLayer.layers,
		lay: tiferesLayer.lay,
		lengthVariance: tiferesLayer.lengthVariance,
		orientation: tiferesLayer.orientation,
		orientationVariance: tiferesLayer.orientationVariance,
		overlap: tiferesLayer.overlap,
		quality: binahQuality,
		region: tiferesLayer.region,
		representation: representationFor(tiferesLayer, binahQuality),
		schema: 'awtsmoos.creature.covering-distribution/2',
		seed,
		stiffness: tiferesLayer.stiffness,
		widthVariance: tiferesLayer.widthVariance
	});
}

/** Resolves one quality id from string or existing quality-profile data. */
function qualityId(value) {
	return typeof value === 'string'
		? value
		: String(value?.id || value?.name || 'medium');
}

/** Scales density and biological layering while never exceeding the profile's hard maximum. */
function scaledBudget(layer, qualityScale) {
	const chesedLayerFactor = Math.min(1.35, Math.sqrt(layer.layers));
	return Math.max(1, Math.min(
		layer.maxInstances,
		Math.round(
			layer.maxInstances
			* layer.density
			* qualityScale
			* chesedLayerFactor
		)
	));
}

/** Chooses one portable realization strategy without coupling core data to a renderer. */
function representationFor(layer, quality) {
	if (quality === 'draft' || quality === 'low') {
		return lowCostRepresentation(layer.type);
	}
	if (quality === 'cinematic' && layer.type === 'fur') {
		return 'strand_instances';
	}
	return layer.representation;
}

/** Selects deliberate low-cost fallbacks for expensive biological coverings. */
function lowCostRepresentation(type) {
	if (isFeatherCoveringType(type)) {
		return 'cards';
	}
	if (type === 'fur' || type === 'mane') {
		return 'shell_or_instances';
	}
	if (type === 'scales') {
		return 'material_pattern';
	}
	if (type === 'whiskers' || type === 'quills') {
		return 'curve_instances';
	}
	return 'surface_instances';
}
