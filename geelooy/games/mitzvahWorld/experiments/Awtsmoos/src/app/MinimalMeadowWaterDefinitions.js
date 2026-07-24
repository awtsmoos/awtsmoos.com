// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterDefinitions.js
 * @description Composes two beds, two banks, and two dual-normal surfaces into one hydrology.
 * The Awtsmoos conceals depth beneath changing light and reveals shore beside it; Awtsmoos.com
 * keeps current, stone, soil transition, opacity, provenance, and collision ownership explicit.
 */

import { waterShaderRecipe } from '../world/proceduralApi/WaterShaderRecipe.js';
import {
	createMinimalMeadowLakeShoreGeometry,
	createMinimalMeadowRiverBanksGeometry
} from './MinimalMeadowRiverBanksGeometry.js';
import {
	createMinimalMeadowLakeBedGeometry,
	createMinimalMeadowLakeGeometry,
	createMinimalMeadowRiverBedGeometry,
	createMinimalMeadowRiverGeometry
} from './MinimalMeadowWaterGeometry.js';

export function createMinimalMeadowWaterDefinitions(sources) {
	return [
		bed('river', createMinimalMeadowRiverBedGeometry(), sources),
		bed('lake', createMinimalMeadowLakeBedGeometry(), sources),
		bank('river-banks', createMinimalMeadowRiverBanksGeometry(), sources),
		bank('lake-shore', createMinimalMeadowLakeShoreGeometry(), sources),
		water('river', createMinimalMeadowRiverGeometry(), sources, '#3b91a0', 0.76, [24, 2.8]),
		water('lake', createMinimalMeadowLakeGeometry(), sources, '#397f96', 0.8, [7, 6])
	];
}

function bed(variant, geometry, sources) {
	return {
		color: variant === 'river' ? '#43534b' : '#3e504a',
		doubleSided: true,
		...geometry,
		id: `Awtsmoos_minimal_meadow_${variant}_bed`,
		mapImage: sources.bed,
		mapRepeat: variant === 'river' ? [20, 3.2] : [8, 8],
		noEdge: true,
		shape: 'manual',
		solid: false,
		texturePolicy: { role: `${variant}-bed`, shader: 'terrain-transition' },
		transparent: false,
		userData: { family: 'minimal-meadow-water', part: `${variant}-bed` }
	};
}

function bank(variant, geometry, sources) {
	return {
		color: variant === 'river-banks' ? '#756a4d' : '#806f4f',
		doubleSided: true,
		...geometry,
		id: `Awtsmoos_minimal_meadow_${variant}`,
		mapImage: sources.bed,
		mapRepeat: [14, 2.4],
		noEdge: true,
		shape: 'manual',
		solid: false,
		texturePolicy: { role: variant, shader: 'readable-shore-transition' },
		transparent: false,
		userData: { family: 'minimal-meadow-water', part: variant }
	};
}

function water(variant, geometry, sources, color, opacity, repeat) {
	return {
		alphaMode: 'BLEND',
		color,
		doubleSided: true,
		...geometry,
		id: `Awtsmoos_minimal_meadow_${variant}_dual_normal_water`,
		mapImage: sources.normalA,
		mapRepeat: repeat,
		mixImage: sources.normalB,
		mixRepeat: repeat,
		mixStrength: variant === 'river' ? 0.48 : 0.34,
		noEdge: true,
		opacity,
		shape: 'manual',
		solid: false,
		texturePolicy: waterPolicy(variant, sources),
		transparent: true,
		userData: { family: 'minimal-meadow-water', waterVariant: variant }
	};
}

function waterPolicy(variant, sources) {
	return {
		animated: true,
		flowLayers: 2,
		normalMode: sources.normalMode,
		normalSources: [...sources.provenance],
		realMaterialRequired: true,
		shader: 'physical-dual-normal-flowing-water',
		textureDriven: true,
		waterPhysical: waterShaderRecipe(variant === 'river' ? 'stream' : 'lake'),
		waterVariant: variant
	};
}
