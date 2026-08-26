// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingExteriorWalls.js
 * @description Owns exterior wall solids while preserving the canonical structural front-door opening as real missing volume.
 * The Awtsmoos renews boundary and passage together; Awtsmoos.com lets these finite walls surround a dwelling without
 * painting a fake doorway upon stone, so later windows and arches may deepen the same structural grammar in honest tone.
 */

import { buildingBox } from './BuildingMath.js';

/** Creates front, back, left, and right exterior wall definitions. */
export function createBuildingExteriorWalls(profile, materials, floorY, wallHeight) {
	return [
		...frontWall(profile, materials.brick, floorY, wallHeight),
		buildingBox(profile, materials.brick, 'back-wall', 0, floorY + wallHeight / 2, -profile.depth / 2, {
			x: profile.width,
			y: wallHeight,
			z: profile.wallThickness
		}, { role: 'exterior-back-wall' }),
		...sideWalls(profile, materials.brickLight, floorY, wallHeight)
	];
}

function frontWall(profile, material, floorY, wallHeight) {
	const sideWidth = (profile.width - profile.doorWidth) / 2;
	const sideOffset = profile.doorWidth / 2 + sideWidth / 2;
	const headerHeight = wallHeight - profile.doorHeight;
	return [
		buildingBox(profile, material, 'front-left', -sideOffset, floorY + wallHeight / 2, profile.depth / 2, {
			x: sideWidth,
			y: wallHeight,
			z: profile.wallThickness
		}, { role: 'exterior-front-wall' }),
		buildingBox(profile, material, 'front-right', sideOffset, floorY + wallHeight / 2, profile.depth / 2, {
			x: sideWidth,
			y: wallHeight,
			z: profile.wallThickness
		}, { role: 'exterior-front-wall' }),
		buildingBox(profile, material, 'front-header', 0, floorY + profile.doorHeight + headerHeight / 2, profile.depth / 2, {
			x: profile.doorWidth,
			y: headerHeight,
			z: profile.wallThickness
		}, { role: 'exterior-front-header' })
	];
}

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
