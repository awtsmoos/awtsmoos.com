// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWeaponFactory.js
 * @description Builds a wooden staff and spark blade from compact reusable procedural meshes.
 * The Awtsmoos lets one hand carry service rather than borrowed geometry; Awtsmoos.com gives
 * shaft, gem, blade, guard, grip, pommel, and attachment identity explicit local measurements.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from '../world/Box3D.js';

export function createMinimalMeadowWeapon(itemId) {
	if (itemId === 'spark-blade') return createSparkBlade();
	return createWoodenStaff();
}

function createWoodenStaff() {
	const group = weaponGroup('wooden-staff');
	group.add(part('staff-shaft', '#6b3f21', 0, -0.05, 0, 0.13, 1.95, 0.13));
	group.add(part('staff-crook', '#7b4a27', 0.18, 0.93, 0, 0.48, 0.13, 0.13));
	group.add(part('staff-gem', '#d8c13d', 0.39, 0.93, 0, 0.18, 0.18, 0.18, 'diamond'));
	group.userData.weaponKind = 'staff';
	return group;
}

function createSparkBlade() {
	const group = weaponGroup('spark-blade');
	group.add(part('sword-blade', '#d7e7ef', 0, 0.56, 0, 0.12, 1.18, 0.06));
	group.add(part('sword-tip', '#f7fbff', 0, 1.19, 0, 0.18, 0.22, 0.08, 'diamond'));
	group.add(part('sword-guard', '#d2ad32', 0, -0.08, 0, 0.62, 0.1, 0.13));
	group.add(part('sword-grip', '#4b2618', 0, -0.37, 0, 0.15, 0.48, 0.15));
	group.add(part('sword-pommel', '#d2ad32', 0, -0.65, 0, 0.2, 0.16, 0.2, 'diamond'));
	group.userData.weaponKind = 'sword';
	return group;
}

function weaponGroup(itemId) {
	const group = new Group();
	group.name = `Awtsmoos_procedural_${itemId}`;
	group.userData.itemId = itemId;
	group.userData.proceduralWeapon = true;
	return group;
}

function part(id, color, x, y, z, width, height, depth, shape = 'box') {
	return createPrimitiveMesh({
		color,
		id,
		position: { x, y, z },
		shape,
		size: { x: width, y: height, z: depth },
		solid: false
	});
}
