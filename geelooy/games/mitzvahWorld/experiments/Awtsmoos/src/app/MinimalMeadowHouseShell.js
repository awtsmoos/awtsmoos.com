// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHouseShell.js
 * @description Builds foundations, textured walls, floors, roof slabs, and front doorway gaps.
 * The Awtsmoos gives shelter without sealing the traveler outside; Awtsmoos.com leaves measured
 * openings for dynamic doors while every visible wall contributes truthful octree collision.
 */

import { houseBox } from './MinimalMeadowHouseMath.js?v=20260724-meadow-17';

export function createMinimalMeadowHouseShell(profile, materials, groundY) {
	const definitions = [];
	const wallHeight = profile.storyHeight * profile.floors;
	const floorY = groundY + profile.floorThickness;
	definitions.push(houseBox(profile, materials.floor, 'foundation', 0, groundY - 0.12, 0, {
		x: profile.width,
		y: 0.24,
		z: profile.depth
	}, { walkable: true }));
	definitions.push(...frontWall(profile, materials.brick, floorY, wallHeight));
	definitions.push(houseBox(profile, materials.brick, 'back-wall', 0, floorY + wallHeight / 2, -profile.depth / 2, {
		x: profile.width,
		y: wallHeight,
		z: profile.wallThickness
	}));
	for (const side of [-1, 1]) definitions.push(houseBox(
		profile,
		materials.brickLight,
		`${side < 0 ? 'left' : 'right'}-wall`,
		side * profile.width / 2,
		floorY + wallHeight / 2,
		0,
		{ x: profile.wallThickness, y: wallHeight, z: profile.depth }
	));
	definitions.push(...storyFloors(profile, materials.floor, floorY));
	definitions.push(houseBox(profile, materials.roof, 'roof', 0, floorY + wallHeight + profile.roofHeight / 2, 0, {
		x: profile.width + 1,
		y: profile.roofHeight,
		z: profile.depth + 1
	}));
	return definitions;
}

function frontWall(profile, material, floorY, wallHeight) {
	const sideWidth = (profile.width - profile.doorWidth) / 2;
	const sideOffset = profile.doorWidth / 2 + sideWidth / 2;
	return [
		houseBox(profile, material, 'front-left', -sideOffset, floorY + wallHeight / 2, profile.depth / 2, { x: sideWidth, y: wallHeight, z: profile.wallThickness }),
		houseBox(profile, material, 'front-right', sideOffset, floorY + wallHeight / 2, profile.depth / 2, { x: sideWidth, y: wallHeight, z: profile.wallThickness }),
		houseBox(profile, material, 'front-header', 0, floorY + profile.doorHeight + (wallHeight - profile.doorHeight) / 2, profile.depth / 2, { x: profile.doorWidth, y: wallHeight - profile.doorHeight, z: profile.wallThickness })
	];
}

function storyFloors(profile, material, floorY) {
	if (profile.floors < 2) return [];
	const upperY = floorY + profile.storyHeight;
	const openingWidth = 3.2;
	return [
		houseBox(profile, material, 'upper-floor-left', -(profile.width - openingWidth) / 4, upperY, 0, { x: (profile.width - openingWidth) / 2, y: profile.floorThickness, z: profile.depth - 1 }, { walkable: true }),
		houseBox(profile, material, 'upper-floor-right', (profile.width - openingWidth) / 4 + openingWidth / 2, upperY, 0, { x: (profile.width - openingWidth) / 2, y: profile.floorThickness, z: profile.depth - 1 }, { walkable: true })
	];
}
