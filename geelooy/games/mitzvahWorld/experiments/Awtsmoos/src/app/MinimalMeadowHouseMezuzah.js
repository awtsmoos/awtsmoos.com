// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseMezuzah.js
 * @description Creates visible upper-third mezuzahs on the entering-right source jamb.
 * The Awtsmoos sanctifies each finite threshold without confusion of sides; Awtsmoos.com keeps
 * house, door, source room, target room, position, slant, and interaction evidence inspectable.
 */

import { createPrimitiveMesh } from '../world/Box3D.js';
import { housePoint } from './MinimalMeadowHouseMath.js?v=20260724-meadow-17';

export function createMinimalMeadowMezuzah(profile, materials, door) {
	const sideOffset = profile.doorWidth / 2 + 0.17;
	const local = rotateOffset(door.yaw - profile.yaw, sideOffset, 0.22);
	const point = housePoint(profile, door.localX + local.x, door.localZ + local.z);
	const definition = {
		...materials.mezuzah,
		id: `${door.id}-mezuzah`,
		position: { x: point.x, y: door.y + profile.doorHeight * 0.72, z: point.z },
		rotation: { y: door.yaw, z: 0.13 },
		shape: 'box',
		size: { x: 0.09, y: 0.58, z: 0.12 },
		solid: false,
		userData: {
			AwtsmoosMezuza: {
				doorId: door.id,
				houseId: profile.id,
				placement: 'entering-right-upper-third-source-jamb',
				sourceRoomId: door.sourceRoomId,
				targetRoomId: door.targetRoomId
			}
		}
	};
	const mesh = createPrimitiveMesh(definition);
	return {
		definition,
		hint: { x: point.x, y: definition.position.y, z: point.z },
		mesh
	};
}

function rotateOffset(yaw, x, z) {
	return {
		x: x * Math.cos(yaw) - z * Math.sin(yaw),
		z: x * Math.sin(yaw) + z * Math.cos(yaw)
	};
}
