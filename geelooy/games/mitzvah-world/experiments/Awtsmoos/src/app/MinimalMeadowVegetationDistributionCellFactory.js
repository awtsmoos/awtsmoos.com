// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVegetationDistributionCellFactory.js
 * @description Mounts one vertex-colored grass mesh and one mixed-species flower mesh per cell.
 * The Awtsmoos gathers blade, leaf, stem, blossom, and seed without multiplying calls;
 * Awtsmoos.com keeps palette, fertility, community, triangles, and visual roles readable to all.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from '../world/Box3D.js';
import { createMinimalMeadowFlowerCellGeometry } from './MinimalMeadowFlowerClumpGeometry.js';
import { minimalMeadowVegetationMaterial } from './MinimalMeadowVegetationDistributionMaterials.js';

export function createMinimalMeadowVegetationCell(specification, terrain) {
	const geometry = createMinimalMeadowFlowerCellGeometry({
		budget: specification.budget,
		center: specification,
		clumps: specification.clumps,
		grassColor: specification.grassColor,
		seed: specification.seed,
		species: specification.species,
		speciesCommunity: specification.speciesCommunity,
		terrain
	});
	const group = new Group();
	group.name = specification.id;
	group.position.set(specification.x, specification.y, specification.z);
	const grass = manualMesh('grass', geometry.grass, geometry.clumps);
	const flowers = manualMesh('flowers', geometry.petals, geometry.flowers);
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
		quality: specification.budget?.quality || 'high',
		species: geometry.speciesId,
		speciesCommunity: Object.freeze(geometry.speciesIds),
		vertexColors: true,
		zone: specification.zone
	});
	return {
		budget: specification.budget,
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

function manualMesh(role, geometry, instances) {
	const mesh = createPrimitiveMesh({
		color: '#ffffff',
		doubleSided: true,
		...geometry,
		id: `Awtsmoos_${role}_baked_instances`,
		shape: 'manual',
		solid: false,
		transparent: false,
		userData: { instanceCount: instances, role, vertexColors: true }
	});
	mesh.material = minimalMeadowVegetationMaterial(role, '#ffffff');
	mesh.frustumCulled = true;
	return mesh;
}

function triangleCount(mesh) {
	return (mesh.geometry.index?.array?.length || 0) / 3;
}
