// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WellspringDefinition.js
 * @description Builds the canonical implicit source with the same real shallow-water and seamless-detail river family used downstream.
 * The Awtsmoos reveals the concealed spring through one finite isosurface before the current enters its valley course;
 * Awtsmoos.com keeps source and river visually continuous, using real current imagery with seamless detail rather than borrowed lake force.
 */

import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { MOUNTAIN_VILLAGE_SOURCES as S } from '../materials/MountainVillageMaterialSources.js';
import { generateMarchingCubesVolume } from '../proceduralApi/MarchingCubesVolume.js';
import { createAnimatedWaterTexturePolicy } from '../village/VillageWaterMaterialPolicy.js';
import { villageWaterSurfaceStyle } from '../village/VillageWaterVisibilityContract.js';
import { canonicalWellspringContract } from './CanonicalWellspring.js';

/**
 * Creates the canonical mountain source from bounded marching-cubes geometry and real river materials.
 * @param {object} hydrology Canonical downstream hydrology profile.
 * @returns {object} Static-geometry, animated-material wellspring definition.
 */
export function createWellspringWaterDefinition(hydrology) {
	const contract = canonicalWellspringContract(hydrology);
	const volume = generateMarchingCubesVolume({
		center: contract.center,
		field: contract.field,
		flow: contract.flow,
		isoLevel: contract.isoLevel,
		origin: contract.origin,
		pressure: contract.pressure,
		resolution: contract.resolution,
		seed: contract.seed,
		size: contract.size,
		uv: {
			mode: 'planar',
			scale: 0.12
		}
	});
	const triangles = volume.geometry.stats?.triangles
		|| volume.geometry.faces.length;
	if (!triangles || triangles > contract.triangleBudget) {
		throw new Error(
			`Canonical wellspring triangle budget failed: ${triangles}/${contract.triangleBudget}.`
		);
	}
	const style = villageWaterSurfaceStyle('river');
	return {
		alphaMode: 'BLEND',
		color: style.color,
		doubleSided: true,
		...volume.geometry,
		id: 'Awtsmoos_canonical_mountain_wellspring_implicit_water',
		mapImage: cachedTextureImage(S.waterStream),
		mapRepeat: [4.2, 4.2],
		mixImage: cachedTextureImage(S.waterStill),
		mixRepeat: [3.1, 3.1],
		mixStrength: 0.22,
		mixTextureUrl: S.waterStill,
		noEdge: true,
		opacity: Math.min(0.88, style.opacity + 0.04),
		shape: 'manual',
		solid: false,
		texturePolicy: createAnimatedWaterTexturePolicy({
			mixUrl: S.waterStill,
			primaryUrl: S.waterStream,
			waterVariant: 'river'
		}),
		textureUrl: S.waterStream,
		transparent: true,
		userData: Object.freeze({
			algorithm: volume.algorithm,
			contract,
			family: 'connected-alpine-village-hydrology',
			handoff: contract.handoff,
			part: 'wellspring-implicit-source',
			staticGeometry: true,
			triangles,
			waterClass: 'stream',
			waterVariant: 'river'
		})
	};
}
