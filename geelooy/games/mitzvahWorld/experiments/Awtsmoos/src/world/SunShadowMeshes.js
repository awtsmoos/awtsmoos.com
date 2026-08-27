// B"H
import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from './Box3D.js';

/** Creates the three restrained transparent meshes used by projected sunlight. */
export function createSunShadowMeshes(scene) {
	const group = new Group();
	group.name = 'Awtsmoos_fast_sun_projected_shadows';
	const player = shadowDisc('player-sun-shadow', 1.05, 0.22);
	const npc = shadowDisc('npc-sun-shadow', 0.95, 0.18);
	const house = shadowBox(
		'house-roof-ground-shadow',
		10.8,
		6.8,
		0.16
	);
	group.add(player);
	group.add(npc);
	group.add(house);
	scene.add(group);
	return { group, player, npc, house };
}

/** Places one shadow and seals its current transform as the renderer base. */
export function placeSunShadow(mesh, x, y, z, yaw) {
	mesh.position.set(x, y, z);
	mesh.quaternion.set(
		0,
		Math.sin(yaw / 2),
		0,
		Math.cos(yaw / 2)
	);
	mesh.setBaseTransform();
}

function shadowDisc(id, radius, opacity) {
	return shadowMaterial(createPrimitiveMesh({
		id,
		shape: 'cylinder',
		color: '#000000',
		solid: false,
		position: { x: 0, y: 0, z: 0 },
		radius,
		height: 0.025,
		segments: 40,
		rotation: {}
	}), opacity);
}

function shadowBox(id, x, z, opacity) {
	return shadowMaterial(createPrimitiveMesh({
		id,
		shape: 'box',
		color: '#000000',
		solid: false,
		position: { x: 0, y: 0, z: 0 },
		size: { x, y: 0.025, z },
		rotation: { y: -0.16 }
	}), opacity);
}

function shadowMaterial(mesh, opacity) {
	mesh.material.opacity = opacity;
	mesh.material.alphaMode = 'BLEND';
	mesh.material.transparent = true;
	mesh.material.color = [0, 0, 0, opacity];
	return mesh;
}
