// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleCinematicObjectGeometry
 * @description
 * Houses, roofs, windows, trees, lamps, paths, and the walking character become
 * ordered screen triangles while retaining their editable world coordinates.
 */

import { rectangle, triangle } from './NleCinematicProjection.js';

export function addHouseGeometry(target, house, project, palette) {
	const point = project(house.x, house.z);
	const width = house.width * 9 * point.scale;
	const height = house.height * 10 * point.scale;
	const roof = house.roofHeight * 7 * point.scale;
	const left = point.x - width / 2;
	const top = point.y - height;
	target.push(...rectangle(left, top, width, height, palette[house.wallMaterial]));
	target.push(triangle([left - width * .08, top], [point.x, top - roof], [left + width * 1.08, top], palette[house.roofMaterial]));
	const window = palette[house.windowMaterial];
	target.push(...rectangle(left + width * .18, top + height * .34, width * .18, height * .24, window));
	target.push(...rectangle(left + width * .64, top + height * .34, width * .18, height * .24, window));
	target.push(...rectangle(point.x - width * .09, point.y - height * .32, width * .18, height * .32, palette['material-wood']));
}

export function addTreeGeometry(target, tree, project, palette, wind = 0, time = 0) {
	const point = project(tree.x, tree.z);
	const scale = tree.scale * point.scale;
	const sway = Math.sin(time * 1.3 + tree.x * .2) * wind * 18 * scale;
	target.push(...rectangle(point.x - 3 * scale, point.y - 36 * scale, 6 * scale, 36 * scale, palette[tree.trunkMaterial]));
	const leaf = palette[tree.leafMaterial];
	target.push(triangle([point.x - 24 * scale, point.y - 30 * scale], [point.x + sway, point.y - 78 * scale], [point.x + 24 * scale, point.y - 30 * scale], leaf));
	target.push(triangle([point.x - 19 * scale, point.y - 50 * scale], [point.x + sway, point.y - 92 * scale], [point.x + 19 * scale, point.y - 50 * scale], leaf));
}

export function addPathGeometry(target, path, project, color) {
	const from = project(path.from[0], path.from[1]);
	const to = project(path.to[0], path.to[1]);
	const dx = to.x - from.x;
	const dy = to.y - from.y;
	const length = Math.max(1, Math.hypot(dx, dy));
	const width = path.width * 4;
	const nx = -dy / length * width;
	const ny = dx / length * width;
	target.push(triangle([from.x + nx, from.y + ny], [to.x + nx, to.y + ny], [to.x - nx, to.y - ny], color));
	target.push(triangle([from.x + nx, from.y + ny], [to.x - nx, to.y - ny], [from.x - nx, from.y - ny], color));
}

export function addLampGeometry(target, lamp, project, palette) {
	const point = project(lamp.x, lamp.z);
	target.push(...rectangle(point.x - 2, point.y - 48, 4, 48, palette['material-wood']));
	target.push(...rectangle(point.x - 8, point.y - 58, 16, 14, palette['material-window']));
}

export function addCharacterGeometry(target, position, project, palette) {
	const point = project(position.x, position.z);
	const scale = point.scale * 1.15;
	const coat = palette['material-coat'];
	target.push(triangle([point.x - 13 * scale, point.y], [point.x, point.y - 58 * scale], [point.x + 13 * scale, point.y], coat));
	target.push(...rectangle(point.x - 8 * scale, point.y - 73 * scale, 16 * scale, 16 * scale, [0.72, .56, .44, 1]));
	target.push(...rectangle(point.x - 15 * scale, point.y - 82 * scale, 30 * scale, 7 * scale, coat));
	target.push(...rectangle(point.x - 10 * scale, point.y - 92 * scale, 20 * scale, 12 * scale, coat));
}
