// B"H
// Boruch Hashem
// Blessed is He
/** One grid declaration keeps every liquid transfer in the same finite vessel. */

import { createScalarGrid3d } from "../volumes/grid3d.js";

export function createLiquidGridDeclaration(input = {}) {
	const source = input.grid ?? input.velocityGrid ?? input.massGrid ?? input;
	const template = createScalarGrid3d({
		width: source.width ?? input.width,
		height: source.height ?? input.height,
		depth: source.depth ?? input.depth,
		cellSize: source.cellSize ?? input.cellSize,
		origin: source.origin ?? input.origin,
		fill: 0
	});
	return Object.freeze({
		width: template.width,
		height: template.height,
		depth: template.depth,
		cellSize: template.cellSize,
		origin: template.origin
	});
}

export function clampLiquidBlend(value = 0.95) {
	const number = Number(value);
	if (!Number.isFinite(number)) {
		throw new TypeError("PIC/FLIP blend must be finite.");
	}
	return Math.max(0, Math.min(1, number));
}
