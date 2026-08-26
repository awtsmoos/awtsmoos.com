// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureMicrodetailSurface.js
 * @description Produces rich renderer-neutral surface parameters for fur, feather, scale, skin, keratin, and soft tissue detail.
 * RESPONSIBILITY: describe strand/layer dimensions, clumping, overlap, curl, ridge, wetness, and LOD behavior without choosing a renderer implementation.
 * NON-RESPONSIBILITY: this module does not allocate hairs, cards, textures, shaders, or mesh topology.
 * The Awtsmoos hides worlds inside the smallest surface; Awtsmoos.com preserves that abundance as semantic law so fur may breathe, scales may overlap, and pores may remain after every remesh.
 */

const BUILDERS = Object.freeze({
	feather: featherProfile,
	fur: furProfile,
	'keratin-ridge': keratinProfile,
	scale: scaleProfile,
	'skin-pore': skinProfile,
	'soft-fold': softFoldProfile
});

/**
 * Creates one immutable detail-specific parameter block.
 * @param {string} type Semantic microdetail type.
 * @param {object} region Tissue region containing dermis and stiffness data.
 * @param {object} input Caller realism overrides.
 * @returns {object} Frozen renderer-neutral surface-detail profile.
 */
export function createCreatureMicrodetailSurface(type, region, input = {}) {
	const builder = BUILDERS[type] || skinProfile;
	return Object.freeze({
		...builder(region, input),
		lod: Object.freeze({
			far: 'baked-normal-roughness',
			middle: type === 'fur' || type === 'feather' ? 'cards-and-shells' : 'procedural-shader',
			near: 'full-semantic-detail'
		})
	});
}

/** Describes layered undercoat, guard hairs, clumping, curl, and wetness. */
function furProfile(region, input) {
	const thickness = region.tissue.dermisThickness;
	return {
		clumping: clamp(input.furClumping ?? 0.18, 0, 1),
		curl: clamp(input.furCurl ?? 0.12, -1, 1),
		directionNoise: clamp(input.furDirectionNoise ?? 0.16, 0, 1),
		guardHairRatio: clamp(input.guardHairRatio ?? 0.22, 0, 1),
		length: positive(input.furLength, Math.max(0.008, thickness * 3.5)),
		rootLift: clamp(input.furRootLift ?? 0.35, 0, 1),
		shedding: clamp(input.furShedding ?? 0.05, 0, 1),
		undercoatDensity: positive(input.undercoatDensity, 1.35),
		wetness: clamp(input.wetness ?? 0, 0, 1)
	};
}

/** Describes feather overlap and vane/barb response while remaining geometry-neutral. */
function featherProfile(region, input) {
	return {
		barbDensity: positive(input.barbDensity, 1),
		flutter: clamp(input.featherFlutter ?? 0.28, 0, 1),
		overlap: clamp(input.featherOverlap ?? 0.42, 0, 0.95),
		shaftStiffness: clamp(input.shaftStiffness ?? region.tissue.stiffness, 0, 1),
		vaneAsymmetry: clamp(input.vaneAsymmetry ?? 0.12, -0.9, 0.9)
	};
}

/** Describes overlapping scale fields with controlled ridge and orientation variance. */
function scaleProfile(region, input) {
	return {
		overlap: clamp(input.scaleOverlap ?? 0.3, 0, 0.95),
		ridge: clamp(input.scaleRidge ?? 0.24, 0, 1),
		size: positive(input.scaleSize, Math.max(0.002, region.tissue.dermisThickness * 0.7)),
		variation: clamp(input.scaleVariation ?? 0.16, 0, 1)
	};
}

/** Describes pore, wrinkle, and vascular hints tied to semantic tissue thickness. */
function skinProfile(region, input) {
	return {
		poreScale: positive(input.poreScale, Math.max(0.0005, region.tissue.dermisThickness * 0.12)),
		vascularHint: clamp(input.vascularHint ?? 0.08, 0, 1),
		wrinkleAmplitude: clamp(input.wrinkleAmplitude ?? 0.1, 0, 1)
	};
}

/** Describes directional ridges for horns, hooves, claws, and armored keratin. */
function keratinProfile(region, input) {
	return {
		growthBands: positive(input.growthBands, 8),
		ridgeAmplitude: clamp(input.ridgeAmplitude ?? 0.18, 0, 1),
		roughnessVariation: clamp(input.keratinRoughnessVariation ?? 0.12, 0, 1)
	};
}

/** Describes fine folds and compliant creases around sensory and soft regions. */
function softFoldProfile(region, input) {
	return {
		creaseDepth: clamp(input.creaseDepth ?? 0.12, 0, 1),
		foldScale: positive(input.foldScale, Math.max(0.001, region.tissue.dermisThickness * 0.8)),
		softness: clamp(1 - region.tissue.stiffness, 0, 1)
	};
}

/** Clamps a finite value into the requested range. */
function clamp(value, minimum, maximum) {
	const number = Number(value);
	return Math.max(minimum, Math.min(maximum, Number.isFinite(number) ? number : minimum));
}

/** Returns a positive finite value or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
