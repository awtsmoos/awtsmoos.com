// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterDefinitions.js
 * @description Composes continuous real-textured river water over earth banks and stone depth.
 * The Awtsmoos reveals a river as one current rather than scattered turquoise shards;
 * Awtsmoos.com lets water, bank, bed, ripple, depth, and reflected sky meet in measured yards.
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
import {
	createMinimalMeadowWaterMaterialDefinition
} from './MinimalMeadowWaterMaterialDefinition.js';

/**
 * Creates river/lake bed, bank, and water definitions from one hydrated source set.
 * @param {object} sources Hydrated real/fallback source images and provenance.
 * @returns {Array<object>} Six world definitions manifested by the water system.
 */
export function createMinimalMeadowWaterDefinitions(sources) {
	return [
		bed('river', createMinimalMeadowRiverBedGeometry(), sources),
		bed('lake', createMinimalMeadowLakeBedGeometry(), sources),
		bank('river-banks', createMinimalMeadowRiverBanksGeometry(), sources),
		bank('lake-shore', createMinimalMeadowLakeShoreGeometry(), sources),
		createMinimalMeadowWaterMaterialDefinition({
			geometry: createMinimalMeadowRiverGeometry(),
			opacity: 0.92,
			repeat: [13, 3.4],
			sources,
			variant: 'river',
			waterPhysical: waterShaderRecipe('stream')
		}),
		createMinimalMeadowWaterMaterialDefinition({
			geometry: createMinimalMeadowLakeGeometry(),
			opacity: 0.9,
			repeat: [7, 6],
			sources,
			variant: 'lake',
			waterPhysical: waterShaderRecipe('lake')
		})
	];
}

function bed(variant, geometry, sources) {
	return {
		color: '#d6d0c2',
		doubleSided: true,
		...geometry,
		id: `Awtsmoos_minimal_meadow_${variant}_bed`,
		mapImage: sources.bed,
		mapRepeat: variant === 'river' ? [20, 3.2] : [8, 8],
		noEdge: true,
		shape: 'manual',
		solid: false,
		texturePolicy: {
			role: `${variant}-bed`,
			shader: 'stone-silt-depth'
		},
		transparent: false,
		userData: {
			family: 'minimal-meadow-water',
			part: `${variant}-bed`
		}
	};
}

function bank(variant, geometry, sources) {
	return {
		color: '#ffffff',
		doubleSided: true,
		...geometry,
		id: `Awtsmoos_minimal_meadow_${variant}`,
		mapImage: sources.bank,
		mapRepeat: [11, 2.8],
		noEdge: true,
		shape: 'manual',
		solid: false,
		texturePolicy: {
			role: variant,
			shader: 'published-earth-shore-transition'
		},
		transparent: false,
		userData: {
			family: 'minimal-meadow-water',
			part: variant
		}
	};
}
