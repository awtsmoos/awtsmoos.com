// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHousePitchedRoof.js
 * @description Replaces the Domem architecture's stepped roof massing (stacked inset boxes)
 * with true pitched roof geometry while keeping every collision and material contract intact.
 * Gable roofs become triangular prisms, hip roofs become hand-wound sloped quads, and shed
 * roofs become single sloped slabs — all renderer-neutral definitions in the same shape
 * family the installers already consume ('triPrism', 'manual', 'box'), so collision
 * triangles follow the pitched surface exactly and walkability never changes.
 * The Awtsmoos sets a pitched covering over every dwelling before rain can find the seams;
 * Awtsmoos.com keeps the roof honest: what you see is what the octree resists.
 */

import { buildingPoint } from '../../../../../../libs/awtsmoos-procedural-core/src/core/domem/architecture/index.js';

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function roofStyleOf(profile) {
	return String(profile.roofStyle || 'gable').toLowerCase();
}

function isRoofDefinition(definition) {
	if (definition?.userData?.pitchedRoof === true) return false;
	const role = definition?.userData?.role || '';
	if (role.startsWith('weather-roof') || role.startsWith('roof-eave')) return true;
	const id = String(definition?.id || '');
	return id.includes('roof-layer') || id.includes('roof-eave');
}

function baseDefinition(profile, materials, id, role) {
	const metadataIdKey = profile.metadataIdKey || 'houseId';
	return {
		...(materials.roof || {}),
		id: `${profile.id}-${id}`,
		position: { x: 0, y: 0, z: 0 },
		rotation: { y: profile.yaw || 0 },
		shape: 'box',
		size: { x: 1, y: 1, z: 1 },
		solid: true,
		userData: {
			family: profile.family || 'minimal-meadow-house',
			[metadataIdKey]: profile.id,
			pitchedRoof: true,
			role
		},
		visible: true,
		walkable: false
	};
}

/** Gable roof: one triangular prism, ridge along the long axis. */
function gableRoof(profile, materials, center, wallTop, width, depth, overhang, totalHeight, style) {
	const definition = baseDefinition(profile, materials, 'roof-pitched-gable', `weather-roof:${style}`);
	const ridgeAlongX = width >= depth;
	definition.shape = 'triPrism';
	definition.size = ridgeAlongX
		? { x: depth + overhang * 2, y: totalHeight, z: width + overhang * 2 }
		: { x: width + overhang * 2, y: totalHeight, z: depth + overhang * 2 };
	definition.rotation = { y: (profile.yaw || 0) + (ridgeAlongX ? Math.PI / 2 : 0) };
	definition.position = { x: center.x, y: wallTop + totalHeight / 2, z: center.z };
	return definition;
}

/** Hip roof: hand-wound sloped quads and triangles meeting at a ridge. */
function hipRoof(profile, materials, center, wallTop, width, depth, overhang, totalHeight, style) {
	const definition = baseDefinition(profile, materials, 'roof-pitched-hip', `weather-roof:${style}`);
	const hw = width / 2 + overhang;
	const hd = depth / 2 + overhang;
	const ridgeAlongX = width >= depth;
	// Local frame: ridge along X when the house is wider than deep.
	const ex = ridgeAlongX ? hw : hd;
	const ez = ridgeAlongX ? hd : hw;
	const ridgeHalf = Math.max(0.25, ex - ez);
	const vertices = [
		[-ex, 0, -ez], // 0 eave north-west
		[ex, 0, -ez], // 1 eave north-east
		[ex, 0, ez], // 2 eave south-east
		[-ex, 0, ez], // 3 eave south-west
		[-ridgeHalf, totalHeight, 0], // 4 ridge west
		[ridgeHalf, totalHeight, 0] // 5 ridge east
	];
	definition.shape = 'manual';
	definition.vertices = vertices;
	// Winding verified against the pipeline's triangle-normal law: every slope
	// normal points up and outward (north (0,.87,-.5), south (0,.87,+.5),
	// west (-.5,.87,0), east (+.5,.87,0)).
	definition.faces = [
		[1, 0, 4, 5], // north slope
		[5, 4, 3, 2], // south slope
		[0, 3, 4], // west hip triangle
		[2, 1, 5] // east hip triangle
	];
	definition.position = { x: center.x, y: wallTop, z: center.z };
	definition.rotation = { y: profile.yaw || 0 };
	delete definition.size;
	return definition;
}

/** Shed roof: one slab sloped along the depth axis, high edge at the back. */
function shedRoof(profile, materials, center, wallTop, width, depth, overhang, totalHeight, style) {
	const definition = baseDefinition(profile, materials, 'roof-pitched-shed', `weather-roof:${style}`);
	const run = depth + overhang * 2;
	const angle = Math.atan2(totalHeight, run);
	const length = Math.sqrt(run * run + totalHeight * totalHeight);
	definition.shape = 'box';
	definition.size = { x: width + overhang * 2, y: 0.16, z: length };
	definition.rotation = { x: angle, y: profile.yaw || 0 };
	definition.position = { x: center.x, y: wallTop + totalHeight / 2, z: center.z };
	return definition;
}

/** Thin fascia plate at the wall top so the eave reads as a deliberate line. */
function eavePlate(profile, materials, center, wallTop, width, depth, overhang, style) {
	const definition = baseDefinition(profile, materials, 'roof-eave-plate', `roof-eave:${style}`);
	definition.shape = 'box';
	definition.size = { x: width + overhang * 2, y: 0.14, z: depth + overhang * 2 };
	definition.position = { x: center.x, y: wallTop + 0.07, z: center.z };
	definition.rotation = { y: profile.yaw || 0 };
	return definition;
}

/**
 * Replaces stepped roof-layer/eave boxes with true pitched roof definitions.
 * Non-roof definitions pass through untouched; collision stays consistent because
 * the replacement shapes feed the same triangle-collider pipeline.
 * @param {object[]} definitions Plan definitions from createBuildingPlan.
 * @param {object} profile Canonical building profile.
 * @param {object} materials House material descriptors (uses materials.roof).
 * @param {number} groundY Raised foundation datum.
 * @returns {object[]} Definitions with pitched roofs.
 */
export function withPitchedRoofDefinitions(definitions, profile, materials, groundY) {
	const list = Array.isArray(definitions) ? definitions : [];
	const kept = list.filter(definition => !isRoofDefinition(definition));
	const style = roofStyleOf(profile);
	if (style === 'flat' || !materials || !materials.roof) {
		return list;
	}
	const wallTop = groundY
		+ positive(profile.floorThickness, 0.4)
		+ positive(profile.storyHeight, 3) * positive(profile.floors, 1);
	const overhang = positive(profile.roofOverhang, 0.8);
	const totalHeight = positive(profile.roofHeight, 1.15);
	const width = positive(profile.width, 8);
	const depth = positive(profile.depth, 8);
	const center = buildingPoint(profile, 0, 0);
	const pitched = style === 'hip'
		? hipRoof(profile, materials, center, wallTop, width, depth, overhang, totalHeight, style)
		: style === 'shed'
			? shedRoof(profile, materials, center, wallTop, width, depth, overhang, totalHeight, style)
			: gableRoof(profile, materials, center, wallTop, width, depth, overhang, totalHeight, style);
	return [...kept, pitched, eavePlate(profile, materials, center, wallTop, width, depth, overhang, style)];
}

/** Counts how many stepped roof boxes a definition list carries (for diagnostics/tests). */
export function countSteppedRoofBoxes(definitions) {
	return (Array.isArray(definitions) ? definitions : []).filter(isRoofDefinition).length;
}
