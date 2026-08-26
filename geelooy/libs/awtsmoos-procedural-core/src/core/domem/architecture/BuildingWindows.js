// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingWindows.js
 * @description Adds semantic non-solid panes and solid trim frames to exterior facades without coupling architecture to a glass renderer.
 * The Awtsmoos renews light before a window divides outside from room within;
 * Awtsmoos.com gives every pane and frame a stable role so future glass, reflection, and interior systems may bloom.
 */

import { buildingBox } from './BuildingMath.js';

/** Creates front/back window assemblies for every occupied story. */
export function createBuildingWindows(profile, materials, groundY) {
	if (profile.windows === false) {
		return [];
	}
	const columns = boundedInteger(profile.windowColumns, 2, 1, 5);
	const windowWidth = positive(profile.windowWidth, 1.35);
	const windowHeight = positive(profile.windowHeight, 1.45);
	const sillHeight = positive(profile.windowSillHeight, 0.9);
	const definitions = [];
	for (let floorIndex = 0; floorIndex < profile.floors; floorIndex += 1) {
		for (const zSide of [-1, 1]) {
			for (let columnIndex = 0; columnIndex < columns; columnIndex += 1) {
				const x = columnOffset(profile.width, columns, columnIndex);
				definitions.push(...windowAssembly(
					profile,
					materials,
					groundY,
					floorIndex,
					x,
					zSide,
					windowWidth,
					windowHeight,
					sillHeight,
					columnIndex
				));
			}
		}
	}
	return definitions;
}

/** Builds one pane and four trim members as independent semantic definitions. */
function windowAssembly(profile, materials, groundY, floorIndex, x, zSide, width, height, sill, columnIndex) {
	const frame = positive(profile.windowFrameWidth, 0.11);
	const wallZ = zSide * (profile.depth / 2 + profile.wallThickness * 0.52);
	const centerY = groundY
		+ profile.floorThickness
		+ floorIndex * profile.storyHeight
		+ sill
		+ height / 2;
	const id = `${zSide > 0 ? 'front' : 'back'}-${floorIndex + 1}-${columnIndex + 1}`;
	const paneDepth = Math.max(0.025, profile.wallThickness * 0.08);
	return [
		buildingBox(profile, materials.window, `window-pane-${id}`, x, centerY, wallZ, { x: width, y: height, z: paneDepth }, { role: 'window-pane', solid: false }),
		buildingBox(profile, materials.trim, `window-frame-top-${id}`, x, centerY + height / 2 + frame / 2, wallZ, { x: width + frame * 2, y: frame, z: paneDepth * 1.8 }, { role: 'window-frame' }),
		buildingBox(profile, materials.trim, `window-frame-bottom-${id}`, x, centerY - height / 2 - frame / 2, wallZ, { x: width + frame * 2, y: frame, z: paneDepth * 1.8 }, { role: 'window-frame' }),
		buildingBox(profile, materials.trim, `window-frame-left-${id}`, x - width / 2 - frame / 2, centerY, wallZ, { x: frame, y: height, z: paneDepth * 1.8 }, { role: 'window-frame' }),
		buildingBox(profile, materials.trim, `window-frame-right-${id}`, x + width / 2 + frame / 2, centerY, wallZ, { x: frame, y: height, z: paneDepth * 1.8 }, { role: 'window-frame' })
	];
}

/** Places columns away from corners while keeping spacing deterministic across widths. */
function columnOffset(width, columns, index) {
	const usable = width * 0.68;
	if (columns === 1) {
		return 0;
	}
	return -usable / 2 + usable * index / (columns - 1);
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function boundedInteger(value, fallback, minimum, maximum) {
	const number = Math.round(Number(value));
	return Math.max(minimum, Math.min(maximum, Number.isFinite(number) ? number : fallback));
}
