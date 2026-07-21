// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageInteriorGeometry.js
 * @description Builds textured floors and partition walls with real traversable door openings.
 * The Awtsmoos divides one shelter without severing its unity; Awtsmoos.com reveals rooms,
 * corridors, and thresholds as one merged interior vessel inside every expanded cottage.
 */

import { createVillageBoxBatch } from './VillageBoxBatch.js';

export function createVillageCottageInterior(options, materials) {
	const boxes = [];
	for (let story = 0; story < options.stories; story += 1) {
		appendStory(boxes, options, story);
	}
	const definition = createVillageBoxBatch(`cottage-interior-${options.id}`, boxes, {
		color: '#76563d',
		family: 'canonical-cottage-interior',
		part: 'floors-partitions-door-openings',
		texturePolicy: {
			publicFirebase: true,
			role: 'cottage-interior-timber',
			shader: 'physical-room-surface',
			tileWorld: 1.2
		},
		textureUrl: materials.wood
	});
	definition.userData.rooms = options.roomCapacity;
	definition.userData.doorOpenings = options.stories * 4;
	definition.userData.houseId = options.id;
	return definition;
}

function appendStory(boxes, options, story) {
	const floorY = options.base + story * options.storyHeight + 0.08;
	boxes.push(localBox(options, 0, floorY, 0, options.width - 0.8, 0.16, options.depth - 0.8));
	const wallY = floorY + options.storyHeight * 0.48;
	const wallHeight = options.storyHeight - 0.32;
	appendDoorWall(boxes, options, 'x', 0, wallY, wallHeight);
	appendDoorWall(boxes, options, 'z', 0, wallY, wallHeight);
}

function appendDoorWall(boxes, options, axis, offset, y, height) {
	const span = axis === 'x' ? options.width - 1.1 : options.depth - 1.1;
	const doorHalf = 0.8;
	const side = (span / 2 - doorHalf) / 2;
	for (const sign of [-1, 1]) {
		const center = sign * (doorHalf + side / 2);
		const localX = axis === 'x' ? center : offset;
		const localZ = axis === 'z' ? center : offset;
		const sizeX = axis === 'x' ? side : 0.18;
		const sizeZ = axis === 'z' ? side : 0.18;
		boxes.push(localBox(options, localX, y, localZ, sizeX, height, sizeZ));
	}
	const lintelY = y + height / 2 - 0.28;
	boxes.push(localBox(
		options,
		axis === 'x' ? 0 : offset,
		lintelY,
		axis === 'z' ? 0 : offset,
		axis === 'x' ? doorHalf * 2 : 0.18,
		0.56,
		axis === 'z' ? doorHalf * 2 : 0.18
	));
}

function localBox(options, localX, y, localZ, sizeX, sizeY, sizeZ) {
	const cosine = Math.cos(options.yaw);
	const sine = Math.sin(options.yaw);
	return {
		position: {
			x: options.x + localX * cosine + localZ * sine,
			y,
			z: options.z - localX * sine + localZ * cosine
		},
		size: { x: sizeX, y: sizeY, z: sizeZ },
		yaw: options.yaw
	};
}
