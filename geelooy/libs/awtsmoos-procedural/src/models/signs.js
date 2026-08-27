// B"H
import { createRng } from '../math/rng.js';
import { assemble, box } from './assembly.js';
import { modelPalette } from './palettes.js';

/**
 * Chapter 5 — A sign is modeled as frame, face, lamps, and generated glyph bars.
 * No image texture pretends to be geometry.
 */
export function storefrontSignMesh(options = {}) {
	const seed = options.seed || 'sign';
	const colors = options.palette || modelPalette(seed);
	const width = options.width || 3.4;
	const height = options.height || 0.78;
	const depth = options.depth || 0.18;
	const random = createRng(seed);
	const parts = [
		box([width, height, depth], [0, 0, 0], colors.dark),
		box([width * 0.92, height * 0.78, depth * 1.08], [0, 0, depth * 0.08], colors.accent),
		...glyphRow(width * 0.76, height * 0.48, depth * 0.7, random, colors.light)
	];
	if (options.lamps !== false) parts.push(...signLamps(width, height, depth, colors));
	return assemble(parts);
}

export function streetSignMesh(options = {}) {
	const colors = options.palette || modelPalette(options.seed || 'street-sign');
	return assemble(
		box([0.12, 2.4, 0.12], [0, 1.2, 0], colors.metal),
		storefrontSignMesh({ ...options, palette: colors, width: 2.2, height: 0.58, depth: 0.14, lamps: false }),
		box([0.86, 0.16, 0.14], [0, 0.78, 0], colors.accent)
	);
}

function glyphRow(width, height, depth, random, color) {
	const count = 4;
	const cell = width / count;
	const parts = [];
	for (let index = 0; index < count; index += 1) {
		const x = -width / 2 + cell * (index + 0.5);
		parts.push(...glyph(x, cell * 0.55, height, depth, random, color));
	}
	return parts;
}

function glyph(x, width, height, depth, random, color) {
	const lean = (random() - 0.5) * 0.35;
	return [
		box([width * 0.18, height, depth], [x, 0, 0.13], color, [0, 0, lean]),
		box([width, height * 0.18, depth], [x, height * 0.34, 0.13], color),
		box([width * (0.55 + random() * 0.3), height * 0.16, depth], [x + width * 0.08, -height * 0.2, 0.13], color)
	];
}

function signLamps(width, height, depth, colors) {
	return [-1, 1].map(side => box(
		[0.18, 0.18, depth * 1.5],
		[side * width * 0.43, height * 0.57, depth * 0.2],
		colors.light
	));
}
