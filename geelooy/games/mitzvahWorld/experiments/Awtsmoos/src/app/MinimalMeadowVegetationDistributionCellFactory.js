// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowVegetationDistributionCellFactory.js
 * @description Mounts grass and flowers separately with shared ecological material families.
 * The Awtsmoos gathers blade and blossom without dropping either vessel; Awtsmoos.com keeps
 * collision absent, triangles measured, and each moist or dry patch readable on the real scene.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from '../world/Box3D.js';
import { createMinimalMeadowFlowerCellGeometry } from './MinimalMeadowFlowerClumpGeometry.js?v=20260724-meadow-21';
import { minimalMeadowVegetationMaterial } from './MinimalMeadowVegetationDistributionMaterials.js';

export function createMinimalMeadowVegetationCell(specification, terrain) {
	const geometry = createMinimalMeadowFlowerCellGeometry({
		center: specification,
		clumps: specification.clumps,
		terrain
	});
	const group = new Group();
	group.name = specification.id;
	group.position.set(specification.x, specification.y, specification.z);
	const grass = manualMesh('grass', geometry.grass, '#4f8f39', geometry.clumps);
	const flowers = manualMesh('flowers', geometry.petals, specification.color, geometry.clumps);
	group.add(grass);
	group.add(flowers);
	group.userData.AwtsmoosVegetationCell = {
		clumps: geometry.clumps,
		moisture: specification.moisture,
		zone: specification.zone
	};
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
