// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MinimalMeadowHouseShell.js
	* @description Builds parameterized walls, level floors, stair opening panels, and measured roof.
	* The Awtsmoos makes an envelope vast yet exact; Awtsmoos.com leaves a human doorway below,
	* a stair opening above, and matching visible/collision dimensions across every expanded edge.
	*/

import { houseBox } from './MinimalMeadowHouseMath.js';

export function createMinimalMeadowHouseShell(profile, materials, groundY) {
	const definitions = [];
	const floorY = groundY + profile.floorThickness;
	const wallHeight = profile.storyHeight * profile.floors;
	definitions.push(houseBox(profile, materials.floor, 'ground-floor', 0, groundY + profile.floorThickness / 2, 0, {
		x: profile.width - profile.wallThickness * 2,
		y: profile.floorThickness,
		z: profile.depth - profile.wallThickness * 2
	}, { role: 'level-interior-floor', walkable: true }));
	definitions.push(...frontWall(profile, materials.brick, floorY, wallHeight));
	definitions.push(houseBox(profile, materials.brick, 'back-wall', 0, floorY + wallHeight / 2, -profile.depth / 2, {
		x: profile.width,
		y: wallHeight,
		z: profile.wallThickness
	}));
	for (const side of [-1, 1]) {
		definitions.push(houseBox(profile, materials.brickLight, `${side < 0 ? 'left' : 'right'}-wall`, side * profile.width / 2, floorY + wallHeight / 2, 0, {
			x: profile.wallThickness,
			y: wallHeight,
			z: profile.depth
		}));
	}
	definitions.push(...upperFloor(profile, materials.floor, floorY));
	definitions.push(houseBox(profile, materials.roof, 'roof', 0, floorY + wallHeight + profile.roofHeight / 2, 0, {
		x: profile.width + 1.6,
		y: profile.roofHeight,
		z: profile.depth + 1.6
	}));
	return definitions;
}

function frontWall(profile, material, floorY, wallHeight) {
	const sideWidth = (profile.width - profile.doorWidth) / 2;
	const sideOffset = profile.doorWidth / 2 + sideWidth / 2;
	const headerHeight = wallHeight - profile.doorHeight;
	return [
		houseBox(profile, material, 'front-left', -sideOffset, floorY + wallHeight / 2, profile.depth / 2, { x: sideWidth, y: wallHeight, z: profile.wallThickness }),
		houseBox(profile, material, 'front-right', sideOffset, floorY + wallHeight / 2, profile.depth / 2, { x: sideWidth, y: wallHeight, z: profile.wallThickness }),
		houseBox(profile, material, 'front-header', 0, floorY + profile.doorHeight + headerHeight / 2, profile.depth / 2, { x: profile.doorWidth, y: headerHeight, z: profile.wallThickness })
	];
}

function upperFloor(profile, material, floorY) {
	if (profile.floors < 2) return [];
	const y = floorY + profile.storyHeight - profile.floorThickness / 2;
	const width = profile.layout.interiorWidth;
	const depth = profile.layout.innerDepth;
	const openingWidth = profile.layout.stairWidth + 1;
	const openingDepth = profile.layout.stairRun + profile.layout.stairLandingDepth + 1;
	const openingCenterZ = depth / 2 - 3 - profile.layout.stairRun / 2;
	const sideWidth = (width - openingWidth) / 2;
	const definitions = [
		houseBox(profile, material, 'upper-floor-left', -(openingWidth / 2 + sideWidth / 2), y, 0, { x: sideWidth, y: profile.floorThickness, z: depth }, { walkable: true }),
		houseBox(profile, material, 'upper-floor-right', openingWidth / 2 + sideWidth / 2, y, 0, { x: sideWidth, y: profile.floorThickness, z: depth }, { walkable: true })
	];
	appendCenterPanel(definitions, profile, material, y, depth / 2, openingCenterZ + openingDepth / 2, openingWidth, 'front');
	appendCenterPanel(definitions, profile, material, y, openingCenterZ - openingDepth / 2, -depth / 2, openingWidth, 'back');
	return definitions;
}

function appendCenterPanel(target, profile, material, y, first, second, width, id) {
	const length = Math.abs(first - second);
	if (length <= 0.1) return;
	target.push(houseBox(profile, material, `upper-floor-${id}`, 0, y, (first + second) / 2, {
		x: width,
		y: profile.floorThickness,
		z: length
	}, { walkable: true }));
}
