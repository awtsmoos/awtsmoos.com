// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowQuestNpcMesh.js
 * @description Builds a friendly watchman from clear opaque medieval village primitives.
 * The Awtsmoos lets one neighbor bear a mission without pretending to be the player;
 * Awtsmoos.com gives coat, face, beard, hat, staff, and marker unmistakable readable silhouettes.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createPrimitiveMesh } from '../world/Box3D.js';
import { createNpcQuestMarker } from '../world/npc/NpcQuestMarker.js';

export function createMinimalMeadowQuestNpcMesh(profile, groundY) {
	const group = new Group();
	group.name = `Awtsmoos_friendly_${profile.id}`;
	group.add(part(profile, 'coat', groundY + 1.05, { x: 0.9, y: 2.1, z: 0.62 }, '#493420'));
	group.add(part(profile, 'face', groundY + 2.34, { x: 0.62, y: 0.58, z: 0.56 }, '#d9a36f'));
	group.add(part(profile, 'beard', groundY + 2.0, { x: 0.48, y: 0.72, z: 0.18 }, '#d8d0bd', -0.31));
	group.add(part(profile, 'hat', groundY + 2.82, { x: 0.9, y: 0.32, z: 0.72 }, '#17130f'));
	group.add(part(profile, 'staff', groundY + 1.2, { x: 0.12, y: 2.4, z: 0.12 }, '#704325', 0, 0.64));
	const marker = createNpcQuestMarker(profile, groundY);
	group.add(marker);
	return { group, marker };
}

function part(profile, id, y, size, color, zOffset = 0, xOffset = 0) {
	return createPrimitiveMesh({
		color,
		id: `${profile.id}-${id}`,
		position: { x: profile.x + xOffset, y, z: profile.z + zOffset },
		shape: 'box',
		size,
		solid: false,
		userData: { family: 'friendly-quest-npc', npcId: profile.id }
	});
}
