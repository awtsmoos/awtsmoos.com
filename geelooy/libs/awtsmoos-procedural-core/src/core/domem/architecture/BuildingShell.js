// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingShell.js
 * @description Builds renderer-neutral floors, exterior wall solids, stair-yielding upper panels, and roof definitions.
 * The Awtsmoos, Atzmus beyond interior and exterior, renews every boundary while remaining beyond all walls and roofs;
 * Awtsmoos.com lets Domem give each enclosure a semantic role so future renderers, physics, and worlds may clothe the same proof.
 */

import { buildingBox } from './BuildingMath.js';

/**
 * Creates the exterior architectural shell for one normalized building.
 * @param {object} profile Normalized building profile.
 * @param {object} materials Opaque brick, brickLight, floor, and roof descriptors.
 * @param {number} groundY Raised foundation datum.
 * @returns {Array<object>} Renderer-neutral primitive definitions.
 */
export function createBuildingShell(profile, materials, groundY) {
	const floorY = groundY + profile.floorThickness;
	const wallHeight = profile.storyHeight * profile.floors;
	return [
		groundFloor(profile, materials.floor, groundY),
		...frontWall(profile, materials.brick, floorY, wallHeight),
		buildingBox(profile, materials.brick, 'back-wall', 0, floorY + wallHeight / 2, -profile.depth / 2, {
			x: profile.width,
			y: wallHeight,
			z: profile.wallThickness
		}, { role: 'exterior-back-wall' }),
		...sideWalls(profile, materials.brickLight, floorY, wallHeight),
		...upperFloor(profile, materials.floor, floorY),
		buildingBox(profile, materials.roof, 'roof', 0, floorY + wallHeight + profile.roofHeight / 2, 0, {
			x: profile.width + 1.6,
			y: profile.roofHeight,
			z: profile.depth + 1.6
		}, { role: 'weather-roof' })
	];
}

function groundFloor(profile, material, groundY) {
	return buildingBox(profile, material, 'ground-floor', 0, groundY + profile.floorThickness / 2, 0, {
		x: profile.width - profile.wallThickness * 2,
		y: profile.floorThickness,
		z: profile.depth - profile.wallThickness * 2
	}, { role: 'level-interior-floor', walkable: true });
}

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

function upperFloor(profile, material, floorY) {
	if (profile.floors < 2) return [];
	const y = floorY + profile.storyHeight - profile.floorThickness / 2;
	const layout = profile.layout;
	const openingWidth = layout.stairWidth + 1;
	const openingDepth = layout.stairRun + layout.stairLandingDepth + 1;
	const openingCenterZ = layout.innerDepth / 2 - 3 - layout.stairRun / 2;
	const sideWidth = (layout.interiorWidth - openingWidth) / 2;
	const definitions = [
		buildingBox(profile, material, 'upper-floor-left', -(openingWidth + sideWidth) / 2, y, 0, { x: sideWidth, y: profile.floorThickness, z: layout.innerDepth }, { role: 'upper-floor-panel', walkable: true }),
		buildingBox(profile, material, 'upper-floor-right', (openingWidth + sideWidth) / 2, y, 0, { x: sideWidth, y: profile.floorThickness, z: layout.innerDepth }, { role: 'upper-floor-panel', walkable: true })
	];
	appendPanel(definitions, profile, material, y, layout.innerDepth / 2, openingCenterZ + openingDepth / 2, openingWidth, 'front');
	appendPanel(definitions, profile, material, y, openingCenterZ - openingDepth / 2, -layout.innerDepth / 2, openingWidth, 'back');
	return definitions;
}

function appendPanel(target, profile, material, y, first, second, width, id) {
	const length = Math.abs(first - second);
	if (length <= 0.1) return;
	target.push(buildingBox(profile, material, `upper-floor-${id}`, 0, y, (first + second) / 2, {
		x: width,
		y: profile.floorThickness,
		z: length
	}, { role: 'upper-floor-panel', walkable: true }));
}
