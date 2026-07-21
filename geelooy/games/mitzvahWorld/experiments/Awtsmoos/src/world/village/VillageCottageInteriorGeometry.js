// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageInteriorGeometry.js
 * @description Builds batched floors and partition walls around real interior door openings.
 */

import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { villageCottageInteriorLayout } from './VillageCottageInteriorLayout.js';

export function createVillageCottageInterior(options, materials) {
	const layout = villageCottageInteriorLayout(options);
	const boxes = [...layout.walls];
	for (let story = 0; story < options.stories; story += 1) {
		boxes.push(floorBox(options, story));
	}
	const definition = createVillageBoxBatch(`cottage-interior-${options.id}`, boxes, {
		color: '#76563d',
		family: 'canonical-cottage-interior',
		part: 'floors-partitions-and-door-openings',
		texturePolicy: {
			role: 'cottage-interior-timber',
			sameOrigin: true,
			shader: 'physical-room-surface',
			tileWorld: 1.2
		},
		textureUrl: materials.wood
	});
	definition.userData.doorOpenings = layout.doors.length;
	definition.userData.houseId = options.id;
	definition.userData.interiorDoorIds = layout.doors.map(door => door.id);
	definition.userData.occupantCapacity = options.roomCapacity;
	definition.userData.roomCount = layout.rooms.length;
	definition.userData.rooms = layout.rooms;
	return definition;
}

function floorBox(options, story) {
	return {
		position: worldPoint(options, 0, options.base + story * options.storyHeight + 0.08, 0),
		size: { x: options.width - 0.8, y: 0.16, z: options.depth - 0.8 },
		yaw: options.yaw
	};
}

function worldPoint(options, localX, y, localZ) {
	const cosine = Math.cos(options.yaw);
	const sine = Math.sin(options.yaw);
	return {
		x: options.x + localX * cosine + localZ * sine,
		y,
		z: options.z - localX * sine + localZ * cosine
	};
}
