// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseRooms.js
 * @description Builds lower and upper room partitions with measured dynamic-door openings.
 * The Awtsmoos distinguishes rooms without dividing the home; Awtsmoos.com leaves passage,
 * header, jamb, source room, target room, and mezuzah ownership explicit at every threshold.
 */

import { houseBox } from './MinimalMeadowHouseMath.js?v=20260724-meadow-17';

export function createMinimalMeadowHouseRooms(profile, materials, groundY) {
	const definitions = [];
	const doors = [];
	const levels = profile.floors > 1 ? [0, 1] : [0];
	for (const level of levels) {
		const floorY = groundY + profile.floorThickness + level * profile.storyHeight;
		const doorway = partition(profile, materials, floorY, level);
		definitions.push(...doorway.definitions);
		doors.push(doorway.door);
	}
	return { definitions, doors, roomCount: levels.length * 2 };
}

function partition(profile, materials, floorY, level) {
	const wallWidth = profile.depth - profile.wallThickness * 2;
	const sideWidth = (wallWidth - profile.doorWidth) / 2;
	const sideOffset = profile.doorWidth / 2 + sideWidth / 2;
	const localX = level === 0 ? 1.8 : -1.8;
	const yaw = Math.PI / 2;
	const prefix = `story-${level + 1}-partition`;
	const definitions = [
		houseBox(profile, materials.brickLight, `${prefix}-front`, localX, floorY + profile.storyHeight / 2, sideOffset, { x: sideWidth, y: profile.storyHeight, z: profile.wallThickness }, { yaw }),
		houseBox(profile, materials.brickLight, `${prefix}-back`, localX, floorY + profile.storyHeight / 2, -sideOffset, { x: sideWidth, y: profile.storyHeight, z: profile.wallThickness }, { yaw }),
		houseBox(profile, materials.brickLight, `${prefix}-header`, localX, floorY + profile.doorHeight + (profile.storyHeight - profile.doorHeight) / 2, 0, { x: profile.doorWidth, y: profile.storyHeight - profile.doorHeight, z: profile.wallThickness }, { yaw })
	];
	return {
		definitions,
		door: {
			id: `${profile.id}-${prefix}-door`,
			level,
			localX,
			localZ: 0,
			sourceRoomId: `${profile.id}-story-${level + 1}-west`,
			targetRoomId: `${profile.id}-story-${level + 1}-east`,
			y: floorY,
			yaw: profile.yaw + yaw
		}
	};
}
