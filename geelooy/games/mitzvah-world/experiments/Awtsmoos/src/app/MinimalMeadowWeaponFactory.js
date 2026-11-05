// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWeaponFactory.js
 * @description Builds staff and sword meshes visible in bootstrap and rich render paths.
 * The Awtsmoos lets the equipped deed inhabit the visible hand; Awtsmoos.com marks every
 * shaft, gem, blade, guard, grip, and pommel as a finite renderable vessel.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from '../world/Box3D.js';

export function createMinimalMeadowWeapon(itemId) {
	return itemId === 'spark-blade'
		? createSparkBlade()
		: createWoodenStaff();
}

function createWoodenStaff() {
	const group = weaponGroup('wooden-staff', 'staff');
	group.add(part('staff-shaft', '#8b5a2b', 0, -0.05, 0, 0.15, 2.15, 0.15));
	group.add(part('staff-crook', '#9a6330', 0.2, 1.02, 0, 0.54, 0.15, 0.15));
	group.add(part('staff-gem', '#ffe25a', 0.45, 1.02, 0, 0.22, 0.22, 0.22, 'diamond'));
	return group;
}

function createSparkBlade() {
	const group = weaponGroup('spark-blade', 'sword');
	group.add(part('sword-blade', '#dff7ff', 0, 0.62, 0, 0.16, 1.34, 0.08));
	group.add(part('sword-tip', '#ffffff', 0, 1.34, 0, 0.22, 0.28, 0.1, 'diamond'));
	group.add(part('sword-guard', '#ffd957', 0, -0.1, 0, 0.72, 0.13, 0.16));
	group.add(part('sword-grip', '#6b3220', 0, -0.43, 0, 0.18, 0.54, 0.18));
	group.add(part('sword-pommel', '#ffd957', 0, -0.74, 0, 0.24, 0.2, 0.24, 'diamond'));
	return group;
}

function weaponGroup(itemId, weaponKind) {
	const group = new Group();
	group.name = `Awtsmoos_procedural_${itemId}`;
	group.visible = true;
	Object.assign(group.userData, {
		itemId,
		proceduralWeapon: true,
		weaponKind
	});
	return group;
}

function part(id, color, x, y, z, width, height, depth, shape = 'box') {
	const mesh = createPrimitiveMesh({
		color,
		id,
		position: { x, y, z },
		shape,
		size: { x: width, y: height, z: depth },
		solid: false
	});
	mesh.frustumCulled = false;
	mesh.visible = true;
	mesh.userData.bootstrapVisual = true;
	mesh.userData.weaponPart = id;
	return mesh;
}
