// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileCreatureMicrodetail.js
 * @description Compiles semantic pores, folds, scales, keratin ridges, layered fur, and feather detail independently from topology.
 * RESPONSIBILITY: bind tissue regions to density, direction, animation, masks, rich surface profiles, and renderer-neutral LOD intent.
 * NON-RESPONSIBILITY: this module does not allocate strands, cards, textures, shaders, or authoritative topology.
 * The Awtsmoos lets Awtsmoos.com regenerate every pore, scale, feather, and strand after lawful remeshing while the semantic creature remains one.
 */

import { createCreatureMicrodetailSurface } from './CreatureMicrodetailSurface.js';

/**
 * Compiles renderer-neutral detail distributions from tissue and semantic roles.
 * @param {object} creature Briah creature document.
 * @param {object} tissueProfile Stable semantic tissue profile.
 * @param {object} input Density, coat, surface-detail, wetness, and distribution overrides.
 * @returns {object} Frozen microdetail artifact safe to regenerate after topology changes.
 */
export function compileCreatureMicrodetail(creature, tissueProfile, input = {}) {
	const density = Math.max(0, finiteNumber(input.density, 1));
	const regions = tissueProfile.regions.map((region, index) => {
		return createRegionDetail(region, index, density, input);
	});
	return Object.freeze({
		preservationPolicy: 'regenerate-from-semantic-regions',
		proceduralCoordinates: Object.freeze([
			'body-axis',
			'geodesic-landmark-distance',
			'principal-curvature',
			'triplanar'
		]),
		regions: Object.freeze(regions),
		sourceBriahHash: creature.contentHash,
		sourceBriahId: creature.id,
		tissueSourceHash: tissueProfile.sourceBriahHash,
		type: 'creature-microdetail-artifact',
		version: '1.1.0'
	});
}

/** Creates one immutable region detail record with animation, mask, and rich surface intent. */
function createRegionDetail(region, index, density, input) {
	const type = detailType(region.role, input);
	return Object.freeze({
		animation: Object.freeze({
			followsSkin: true,
			secondaryMotion: region.tissue.stiffness < 0.5,
			windResponse: type === 'fur' || type === 'feather'
		}),
		density: density * (0.65 + (index % 7) * 0.055),
		directionField: directionField(region.role),
		mask: Object.freeze({
			dorsalBias: finiteNumber(input.dorsalBias, 0.2),
			landmarkDistance: true,
			regionIds: Object.freeze([region.regionId]),
			type: 'semantic-region'
		}),
		regionId: region.regionId,
		scale: Math.max(0.0005, region.tissue.dermisThickness * 0.18),
		surface: createCreatureMicrodetailSurface(type, region, input),
		type
	});
}

/** Resolves semantic anatomy into a stable microdetail family. */
function detailType(role, input) {
	if (input.detailType) {
		return input.detailType;
	}
	if (/wing|bird|feather/.test(role)) {
		return 'feather';
	}
	if (/armor|horn|claw|hoof|keratin/.test(role)) {
		return 'keratin-ridge';
	}
	if (/fish|fin|swim|scale/.test(role)) {
		return 'scale';
	}
	if (/eye|mouth|nose|ear/.test(role)) {
		return 'soft-fold';
	}
	return input.coat === 'fur' ? 'fur' : 'skin-pore';
}

/** Selects a semantic orientation field without coupling detail to mesh indices. */
function directionField(role) {
	return /limb|support|wing|fin/.test(role)
		? 'follow-anatomical-axis'
		: 'follow-principal-curvature';
}

/** Returns one finite numeric input or a stable fallback. */
function finiteNumber(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
