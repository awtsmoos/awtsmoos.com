// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterDefinitions.js
 * @description Composes beds, banks, uploaded color/detail, and two real moving normal sources.
 * The Awtsmoos conceals depth beneath changing light and reveals shore beside it; Awtsmoos.com
 * keeps visible water color, seamless detail, physical normals, opacity, and collision ownership clear.
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
		water('river', createMinimalMeadowRiverGeometry(), sources, 0.82, [20, 3]),
		water('lake', createMinimalMeadowLakeGeometry(), sources, 0.86, [7, 6])
	];
}

function bed(variant, geometry, sources) {
	return {
		color: '#ffffff',
		doubleSided: true,
		...geometry,
		id: `Awtsmoos_minimal_meadow_${variant}_bed`,
		mapImage: sources.bed,
		mapRepeat: variant === 'river' ? [20, 3.2] : [8, 8],
		noEdge: true,
		shape: 'manual',
		solid: false,
		texturePolicy: { role: `${variant}-bed`, shader: 'stone-silt-depth' },
		transparent: false,
		userData: { family: 'minimal-meadow-water', part: `${variant}-bed` }
	};
}

function bank(variant, geometry, sources) {
	return {
		color: '#e8d8b5',
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

function water(variant, geometry, sources, opacity, repeat) {
	return {
		alphaMode: 'BLEND',
		color: '#d9f7ff',
		doubleSided: true,
		...geometry,
		id: `Awtsmoos_minimal_meadow_${variant}_textured_normal_water`,
		mapImage: sources.color,
		mapRepeat: repeat,
		mixImage: sources.detail,
		mixRepeat: repeat,
		mixStrength: variant === 'river' ? 0.42 : 0.3,
		noEdge: true,
		normalDetailImage: sources.normalB,
		normalImage: sources.normalA,
		opacity,
		shape: 'manual',
		solid: false,
		textureLayers: waterLayers(sources),
		texturePolicy: waterPolicy(variant, sources),
		transparent: true,
		userData: { family: 'minimal-meadow-water', waterVariant: variant }
	};
}

function waterLayers(sources) {
	return [
		{ image: sources.color, role: 'water-color', strength: 1 },
		{ image: sources.detail, role: 'seamless-water-detail', strength: 0.42 },
		{ image: sources.normalA, role: 'current-normal', strength: 1 },
		{ image: sources.normalB, role: 'micro-ripple-normal', strength: 0.72 }
	];
}

function waterPolicy(variant, sources) {
	return {
		animated: true,
		colorMode: sources.colorMode,
		flowLayers: 4,
		normalMode: sources.normalMode,
		normalSources: [...sources.provenance],
		realMaterialRequired: true,
		shader: 'textured-dual-normal-flowing-water',
		textureDriven: true,
		waterPhysical: waterShaderRecipe(variant === 'river' ? 'stream' : 'lake'),
		waterVariant: variant
	};
}
