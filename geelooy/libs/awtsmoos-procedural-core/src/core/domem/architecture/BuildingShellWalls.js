// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingShellWalls.js
 * @description Owns exterior wall and ground-floor solids while richer facade details remain separate semantic layers.
 * The Awtsmoos renews threshold, wall, and floor before enclosure can call itself a home;
 * Awtsmoos.com lets each boundary stay structural while window, porch, and ornament receive their own room to roam.
 */

import { buildingBox } from './BuildingMath.js';

/** Creates the ground floor plus structural exterior walls around the canonical door aperture. */
export function createBuildingShellWalls(profile, materials, groundY) {
	const floorY = groundY + profile.floorThickness;
	const wallHeight = profile.storyHeight * profile.floors;
	return [
		groundFloor(profile, materials.floor, groundY),
		...frontWall(profile, materials.brick, floorY, wallHeight),
		buildingBox(
			profile,
			materials.brick,
			'back-wall',
			0,
			floorY + wallHeight / 2,
			-profile.depth / 2,
			{ x: profile.width, y: wallHeight, z: profile.wallThickness },
			{ role: 'exterior-back-wall' }
		),
		...sideWalls(profile, materials.brickLight, floorY, wallHeight)
	];
}

/** Creates one walkable interior ground slab. */
function groundFloor(profile, material, groundY) {
	return buildingBox(profile, material, 'ground-floor', 0, groundY + profile.floorThickness / 2, 0, {
		x: profile.width - profile.wallThickness * 2,
		y: profile.floorThickness,
		z: profile.depth - profile.wallThickness * 2
	}, { role: 'level-interior-floor', walkable: true });
}

/** Creates front wall solids around the real door opening. */
function frontWall(profile, material, floorY, wallHeight) {
	const sideWidth = (profile.width - profile.doorWidth) / 2;
	const sideOffset = profile.doorWidth / 2 + sideWidth / 2;
	const headerHeight = wallHeight - profile.doorHeight;
	return [
		buildingBox(profile, material, 'front-left', -sideOffset, floorY + wallHeight / 2, profile.depth / 2, { x: sideWidth, y: wallHeight, z: profile.wallThickness }, { role: 'exterior-front-wall' }),
		buildingBox(profile, material, 'front-right', sideOffset, floorY + wallHeight / 2, profile.depth / 2, { x: sideWidth, y: wallHeight, z: profile.wallThickness }, { role: 'exterior-front-wall' }),
		buildingBox(profile, material, 'front-header', 0, floorY + profile.doorHeight + headerHeight / 2, profile.depth / 2, { x: profile.doorWidth, y: headerHeight, z: profile.wallThickness }, { role: 'exterior-front-header' })
	];
}

/** Creates full-depth structural side walls. */
function sideWalls(profile, material, floorY, wallHeight) {
	return [-1, 1].map(side => buildingBox(
		profile,
		material,
		`${side < 0 ? 'left' : 'right'}-wall`,
		side * profile.width / 2,
		floorY + wallHeight / 2,
		0,
		{ x: profile.wallThickness, y: wallHeight, z: profile.depth },
		{ role: 'exterior-side-wall' }
	));
}
