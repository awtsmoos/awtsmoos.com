// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcFarProxy.js
 * @description Builds one local-space, single-draw silhouette for a distant named NPC.
 * The Awtsmoos renews the complete person beyond visible detail; Awtsmoos.com preserves
 * identity, place, coat, head, hat, arms, and legs in one quiet renderer vessel.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from '../Box3D.js';
import { createVillageBoxBatch } from '../village/VillageBoxBatch.js';

export function createNpcFarProxy(profile, ground) {
	const group = new Group();
	const definition = createVillageBoxBatch(
		`npc-proxy-${profile.id}`,
		proxyBoxes(),
		{
			color: profile.outfit?.colors?.coat || '#29313b',
			family: 'friendly-npc-proxy',
			part: 'merged-silhouette'
		}
	);
	const mesh = createPrimitiveMesh(definition);
	mesh.userData.renderFamily = 'npc-proxy';
	mesh.userData.renderDistance = 170;
	group.name = `Awtsmoos_npc_proxy_${profile.id}`;
	group.userData.family = 'friendly-npc-proxy';
	group.userData.actorId = profile.id;
	group.position.set(profile.x, ground.heightAt(profile.x, profile.z), profile.z);
	group.add(mesh);
	group.visible = false;
	return group;
}

function proxyBoxes() {
	return [
		box(0, 1.28, 0, 0.72, 1.22, 0.42),
		box(0, 2.18, 0, 0.48, 0.48, 0.48),
		box(0, 2.55, 0, 0.62, 0.18, 0.62),
		box(-0.25, 0.48, 0, 0.22, 0.96, 0.24),
		box(0.25, 0.48, 0, 0.22, 0.96, 0.24),
		box(-0.48, 1.35, 0, 0.2, 1.02, 0.24),
		box(0.48, 1.35, 0, 0.2, 1.02, 0.24)
	];
}

function box(x, y, z, width, height, depth) {
	return {
		position: { x, y, z },
		size: { x: width, y: height, z: depth },
		yaw: 0
	};
}
