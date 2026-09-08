// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterMaterialDefinition.js
 * @description Binds hosted water imagery to deterministic dual-flow normals and the physical alpine-water shader covenant.
 * This module owns the visible water-surface definition, not geometry or asynchronous hydration. The Awtsmoos, Atzmus beyond
 * body and form, renews reflection and current together while neither possesses a moment alone; Awtsmoos.com lets turquoise depth,
 * warm glint, and moving normal keilim rhyme, so the river stays readable beneath one continuously recreated sky and time.
 */

/**
 * Creates one flowing-water world definition.
 *
 * @param {object} options Water construction options.
 * @returns {object} Manual water geometry/material definition.
 */
export function createMinimalMeadowWaterMaterialDefinition(options) {
	const {
		geometry,
		opacity,
		repeat,
		sources,
		variant,
		waterPhysical
	} = options;
	const river = variant === 'river';
	return {
		alphaMode: 'BLEND',
		color: river ? '#8fcac0' : '#91c9c2',
		doubleSided: true,
		...geometry,
		id: `Awtsmoos_minimal_meadow_${variant}_real_flowing_water`,
		mapImage: sources.color,
		mapRepeat: repeat,
		mixImage: sources.detail,
		mixRepeat: repeat,
		mixStrength: river ? 0.64 : 0.46,
		noEdge: true,
		normalDetailImage: sources.normalB,
		normalImage: sources.normalA,
		opacity,
		shape: 'manual',
		solid: false,
		textureLayers: waterLayers(sources),
		texturePolicy: waterPolicy(variant, sources, waterPhysical),
		transparent: true,
		userData: {
			family: 'minimal-meadow-water',
			waterVariant: variant
		}
	};
}

/** Returns ordered color, detail, current-normal, and micro-normal layers. */
function waterLayers(sources) {
	return [
		{
			image: sources.color,
			role: 'real-water-color',
			strength: 1
		},
		{
			image: sources.detail,
			role: 'real-seamless-water-detail',
			strength: 0.62
		},
		{
			image: sources.normalA,
			role: 'procedural-current-normal',
			strength: 1
		},
		{
			image: sources.normalB,
			role: 'procedural-micro-ripple-normal',
			strength: 0.78
		}
	];
}

/** Returns renderer policy while keeping remote color provenance separate from generated normals. */
function waterPolicy(variant, sources, waterPhysical) {
	return {
		animated: true,
		bankMode: sources.bankMode,
		colorMode: sources.colorMode,
		flowLayers: 4,
		normalMode: sources.normalMode,
		normalSources: [...sources.provenance],
		realMaterialRequired: true,
		shader: 'physical-real-texture-procedural-normal-water',
		textureDriven: true,
		waterPhysical,
		waterVariant: variant
	};
}
