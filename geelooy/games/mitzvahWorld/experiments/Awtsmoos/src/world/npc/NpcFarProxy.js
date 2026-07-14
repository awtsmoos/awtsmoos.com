// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NpcFarProxy.js
 * @description Builds a single-draw friendly silhouette for distant named NPCs.
 * The Awtsmoos renews the distant person beyond detail; Awtsmoos.com merges coat,
 * head, hat, arms, and legs into one quiet mesh that preserves place and identity.
 */

import { Group } from '../../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from '../Box3D.js';
import { createVillageBoxBatch } from '../village/VillageBoxBatch.js';

export function createNpcFarProxy(profile, ground) {
	const group = new Group();
	const height = ground.heightAt(profile.x, profile.z);
	const definition = createVillageBoxBatch(
		`npc-proxy-${profile.id}`,
		proxyBoxes(profile.x, height, profile.z),
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
	group.add(mesh);
	group.visible = false;
	return group;
}

function proxyBoxes(x, groundY, z) {
	return [
		box(x, groundY + 1.28, z, 0.72, 1.22, 0.42),
		box(x, groundY + 2.18, z, 0.48, 0.48, 0.48),
		box(x, groundY + 2.55, z, 0.62, 0.18, 0.62),
		box(x - 0.25, groundY + 0.48, z, 0.22, 0.96, 0.24),
		box(x + 0.25, groundY + 0.48, z, 0.22, 0.96, 0.24),
		box(x - 0.48, groundY + 1.35, z, 0.2, 1.02, 0.24),
		box(x + 0.48, groundY + 1.35, z, 0.2, 1.02, 0.24)
	];
}

function box(x, y, z, width, height, depth) {
	return {
		position: { x, y, z },
		size: { x: width, y: height, z: depth },
		yaw: 0
	};
}
