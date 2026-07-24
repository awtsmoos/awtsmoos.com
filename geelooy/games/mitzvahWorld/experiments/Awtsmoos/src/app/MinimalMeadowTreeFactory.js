// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTreeFactory.js
 * @description Builds simple bark-textured trunks and crossed alpha-cutout leaf crowns.
 * The Awtsmoos raises branch from earth through a small faithful vessel; Awtsmoos.com keeps
 * bark opaque, leaves MASK-cut, species metadata, wind phase, and low-poly silhouette explicit.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from '../world/Box3D.js';

export function createMinimalMeadowTree(placement, materials) {
	const group = new Group();
	group.name = placement.id;
	group.position.set(placement.x, placement.y, placement.z);
	group.quaternion.set(0, Math.sin(placement.yaw / 2), 0, Math.cos(placement.yaw / 2));
	group.scale.set(placement.scale, placement.scale, placement.scale);
	group.add(trunk(materials.bark));
	for (const specification of crownSpecifications()) group.add(crownCard(specification, materials.leaf));
	group.userData.AwtsmoosTree = {
		alphaMode: 'MASK',
		generatorAuthority: 'awtsmoos-procedural-core',
		preset: placement.preset,
		windPhase: placement.yaw
	};
	return group;
}

function trunk(material) {
	return createPrimitiveMesh({
		...material,
		id: 'tree-trunk-bark',
		position: { x: 0, y: 2.25, z: 0 },
		shape: 'cylinder',
		size: { x: 0.72, y: 4.5, z: 0.72 },
		solid: false,
		userData: { part: 'opaque-bark-trunk' }
	});
}

function crownCard(specification, material) {
	return createPrimitiveMesh({
		...material,
		alphaCutoff: 0.34,
		alphaMode: 'MASK',
		doubleSided: true,
		id: `tree-leaf-card-${specification.id}`,
		position: specification.position,
		rotation: { y: specification.yaw, z: specification.roll || 0 },
		shape: 'box',
		size: specification.size,
		solid: false,
		transparent: false,
		userData: { part: 'alpha-cutout-leaf-crown' }
	});
}

function crownSpecifications() {
	return [
		{ id: 'a', position: { x: 0, y: 5.2, z: 0 }, size: { x: 4.7, y: 3.6, z: 0.08 }, yaw: 0 },
		{ id: 'b', position: { x: 0, y: 5.2, z: 0 }, size: { x: 4.7, y: 3.6, z: 0.08 }, yaw: Math.PI / 2 },
		{ id: 'c', position: { x: 0, y: 6.15, z: 0 }, size: { x: 3.4, y: 2.4, z: 0.08 }, yaw: Math.PI / 4, roll: 0.08 }
	];
}
