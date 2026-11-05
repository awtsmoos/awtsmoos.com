//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file SunShadowMeshes.js
 * @description Creates the restrained projected-shadow presentation used by the lightweight sunlight system.
 * Primitive geometry stays delegated to shared MitzvahWorld primitives while hierarchy allocation stays in Procedural Core.
 */

import { createNativeWorldGroup } from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { createPrimitiveMesh } from './Box3D.js';

/**
 * Creates the three transparent shadow meshes and attaches their Core-owned root to the scene.
 * @param {object} scene Scene root exposing add().
 * @returns {{group:object,player:object,npc:object,house:object}} Stable shadow presentation vessels.
 */
export function createSunShadowMeshes(scene) {
	const group = createNativeWorldGroup({
		name: 'Awtsmoos_fast_sun_projected_shadows'
	});
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
	return {
		group,
		house,
		npc,
		player
	};
}

/**
 * Places one shadow and seals its current transform as the renderer base.
 * @param {object} mesh Shadow mesh.
 * @param {number} x World X coordinate.
 * @param {number} y World Y coordinate.
 * @param {number} z World Z coordinate.
 * @param {number} yaw Y-axis rotation in radians.
 * @returns {void}
 */
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

/** Creates one circular projected shadow with a soft radial falloff: three nested
 *  discs (dense core, soft mid, faint edge) so contact reads grounded, not stamped. */
function shadowDisc(id, radius, opacity) {
	const group = createNativeWorldGroup({ name: `${id}-soft` });
	const rings = [
		{ scale: 0.55, alpha: 1.0, lift: 0.0 },
		{ scale: 0.80, alpha: 0.55, lift: 0.004 },
		{ scale: 1.00, alpha: 0.25, lift: 0.008 }
	];
	for (const [index, ring] of rings.entries()) {
		const disc = shadowMaterial(createPrimitiveMesh({
			id: `${id}-ring-${index}`,
			shape: 'cylinder',
			color: '#000000',
			solid: false,
			position: { x: 0, y: ring.lift, z: 0 },
			radius: radius * ring.scale,
			height: 0.025,
			segments: 40,
			rotation: {}
		}), opacity * ring.alpha);
		group.add(disc);
	}
	group.setBaseTransform = () => {
		for (const child of group.children || []) child.setBaseTransform?.();
	};
	return group;
}

/** Creates one rectangular projected roof shadow using shared primitive geometry. */
function shadowBox(id, x, z, opacity) {
	return shadowMaterial(createPrimitiveMesh({
		id,
		shape: 'box',
		color: '#000000',
		solid: false,
		position: { x: 0, y: 0, z: 0 },
		size: {
			x,
			y: 0.025,
			z
		},
		rotation: {
			y: -0.16
		}
	}), opacity);
}

/** Applies the bounded transparent-black material state shared by all projected shadows. */
function shadowMaterial(mesh, opacity) {
	mesh.material.opacity = opacity;
	mesh.material.alphaMode = 'BLEND';
	mesh.material.transparent = true;
	mesh.material.color = [0, 0, 0, opacity];
	return mesh;
}
