// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVegetationDistributionCellFactory.js
 * @description Mounts one ecology-driven grass mesh and one species-aware flower mesh per cell.
 * The Awtsmoos gathers blade and blossom without multiplying draw calls;
 * Awtsmoos.com keeps species, fertility, density, triangles, and every visual role readable.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from '../world/Box3D.js';
import {
	createMinimalMeadowFlowerCellGeometry
} from './MinimalMeadowFlowerClumpGeometry.js';
import {
	minimalMeadowVegetationMaterial
} from './MinimalMeadowVegetationDistributionMaterials.js';

export function createMinimalMeadowVegetationCell(specification, terrain) {
	const geometry = createMinimalMeadowFlowerCellGeometry({
		center: specification,
		clumps: specification.clumps,
		seed: specification.seed,
		species: specification.species,
		terrain
	});
	const group = new Group();
	group.name = specification.id;
	group.position.set(specification.x, specification.y, specification.z);
	const grass = manualMesh(
		'grass',
		geometry.grass,
		specification.grassColor || '#4f8f39',
		geometry.clumps
	);
	const flowers = manualMesh(
		'flowers',
		geometry.petals,
		specification.color,
		geometry.flowers
	);
	group.add(grass);
	group.add(flowers);
	group.userData.AwtsmoosVegetationCell = Object.freeze({
		clumps: geometry.clumps,
		fertility: specification.fertility,
		flowerDensity: specification.flowerDensity,
		flowers: geometry.flowers,
		grassDensity: specification.grassDensity,
		moisture: specification.moisture,
		petalCount: geometry.petalCount,
		species: geometry.speciesId,
		zone: specification.zone
	});
	return {
		clumps: geometry.clumps,
		directionX: 0,
		directionZ: 0,
		group,
		reaction: 0,
		triangles: triangleCount(grass) + triangleCount(flowers),
		x: specification.x,
		z: specification.z
	};
}

function manualMesh(role, geometry, color, instances) {
	const mesh = createPrimitiveMesh({
		color,
		doubleSided: true,
		...geometry,
		id: `Awtsmoos_${role}_baked_instances`,
		shape: 'manual',
		solid: false,
		transparent: false,
		userData: { instanceCount: instances, role }
	});
	mesh.material = minimalMeadowVegetationMaterial(role, color);
	return mesh;
}

function triangleCount(mesh) {
	return (mesh.geometry.index?.array?.length || 0) / 3;
}
