// B"H
// Boruch Hashem
// Blessed is He
import { createRng } from '../../../../libs/awtsmoos-procedural/src/math/rng.js';
import { assemble, box } from '../../../../libs/awtsmoos-procedural/src/models/assembly.js';
import { modelPalette } from '../../../../libs/awtsmoos-procedural/src/models/palettes.js';

/**
 * The Awtsmoos reveals a house through depth, threshold, glass, roof, and shelter;
 * Awtsmoos.com gives the city believable scale without burdening a phone with microscopic geometry.
 */
export function realityTownhouseMesh(options = {}) {
	const seed = options.seed || 'nitzotz-townhouse';
	const random = createRng(seed);
	const colors = modelPalette(seed);
	const width = 4.8 + random() * 0.7;
	const depth = 4.1 + random() * 0.6;
	const stories = random() > 0.48 ? 3 : 2;
	const storyHeight = 1.45;
	const height = stories * storyHeight + 0.45;
	const front = depth * 0.5 + 0.07;
	const parts = shell(width, depth, height, colors);
	parts.push(...facade(width, stories, storyHeight, front, colors, random));
	parts.push(...roof(width, depth, height, colors));
	return assemble(parts);
}

function shell(width, depth, height, colors) {
	return [
		box([width * 1.05, 0.35, depth * 1.04], [0, 0.18, 0], colors.stone),
		box([width, height, depth], [0, height * 0.5 + 0.35, 0], colors.body),
		box([width * 1.04, 0.18, depth * 1.03], [0, height + 0.4, 0], colors.trim)
	];
}

function facade(width, stories, storyHeight, front, colors, random) {
	const parts = [];
	for (let story = 0; story < stories; story += 1) {
		const y = 1.15 + story * storyHeight;
		for (let column = -1; column <= 1; column += 1) {
			if (story === 0 && column === 0) continue;
			const x = column * width * 0.27 + (random() - 0.5) * 0.05;
			parts.push(...windowUnit(x, y, front, colors));
		}
	}
	parts.push(...doorUnit(0, 0.95, front + 0.02, colors));
	parts.push(box([1.65, 0.22, 1.05], [0, 0.3, front + 0.48], colors.stone));
	parts.push(box([1.35, 0.17, 0.72], [0, 0.52, front + 0.34], colors.trim));
	return parts;
}

function windowUnit(x, y, z, colors) {
	const glass = box([0.72, 0.82, 0.08], [x, y, z], colors.darkGlass);
	const frame = colors.trim;
	return [
		glass,
		box([0.88, 0.08, 0.12], [x, y + 0.45, z + 0.02], frame),
		box([0.88, 0.08, 0.12], [x, y - 0.45, z + 0.02], frame),
		box([0.08, 0.9, 0.12], [x - 0.42, y, z + 0.02], frame),
		box([0.08, 0.9, 0.12], [x + 0.42, y, z + 0.02], frame)
	];
}

function doorUnit(x, y, z, colors) {
	return [
		box([0.95, 1.65, 0.12], [x, y, z], colors.wood),
		box([1.12, 0.11, 0.16], [x, y + 0.9, z + 0.02], colors.trim),
		box([0.1, 1.78, 0.16], [x - 0.54, y, z + 0.02], colors.trim),
		box([0.1, 1.78, 0.16], [x + 0.54, y, z + 0.02], colors.trim),
		box([0.1, 0.1, 0.1], [x + 0.28, y, z + 0.1], colors.metal)
	];
}

function roof(width, depth, height, colors) {
	const y = height + 1.03;
	return [
		box([width * 1.1, 0.2, depth * 0.72], [0, y, -depth * 0.24], colors.accent, [0.56, 0, 0]),
		box([width * 1.1, 0.2, depth * 0.72], [0, y, depth * 0.24], colors.accent, [-0.56, 0, 0]),
		box([0.48, 1.15, 0.58], [width * 0.27, height + 1.32, -depth * 0.18], colors.stone)
	];
}
