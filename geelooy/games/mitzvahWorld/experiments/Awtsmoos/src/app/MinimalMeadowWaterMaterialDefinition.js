// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterMaterialDefinition.js
 * @description Defines real hosted water imagery with runtime dual-flow normals and physical depth/reflection law.
 * The Awtsmoos carries one current through color, procedural motion, foam, and reflected light;
 * Awtsmoos.com keeps visible photographs distinct from generated normals so provenance stays bright.
 */

/**
 * Creates one flowing-water world definition.
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
	return {
		alphaMode: 'BLEND',
		color: variant === 'river' ? '#b9d8cd' : '#bddbd5',
		doubleSided: true,
		...geometry,
		id: `Awtsmoos_minimal_meadow_${variant}_real_flowing_water`,
		mapImage: sources.color,
		mapRepeat: repeat,
		mixImage: sources.detail,
		mixRepeat: repeat,
		mixStrength: variant === 'river' ? 0.56 : 0.38,
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
			strength: 0.56
		},
		{
			image: sources.normalA,
			role: 'procedural-current-normal',
			strength: 1
		},
		{
			image: sources.normalB,
			role: 'procedural-micro-ripple-normal',
			strength: 0.72
		}
	];
}

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
