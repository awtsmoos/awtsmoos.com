// B"H
import { modelMesh } from '../models/catalog.js';
import { transformMesh } from '../mesh/transform.js';

/**
 * A building is now a generated architectural model, not one stretched cube.
 * Legacy callers retain one function while gaining real façades and rooflines.
 */
export function buildingMesh(options = {}) {
	const width = clamp(options.width ?? 6, 1, 32);
	const depth = clamp(options.depth ?? 5, 1, 32);
	const height = clamp(options.height ?? 9, 2, options.maxHeight ?? 80);
	const style = options.style || styleFor(height);
	const source = modelMesh(style, { seed: options.seed || `${style}-${width}-${height}-${depth}` });
	return transformMesh(source, {
		scale: [width / 6, height / nominalHeight(style), depth / 5],
		translate: [options.x ?? 0, 0, options.z ?? 0]
	});
}

export function clamp(value, min, max) {
	if (!Number.isFinite(value)) return min;
	return Math.max(min, Math.min(max, value));
}

function styleFor(height) {
	if (height > 28) return 'tower';
	if (height > 16) return 'studyHall';
	return height > 9 ? 'shop' : 'townhouse';
}

function nominalHeight(style) {
	return ({ townhouse: 7, shop: 5.5, studyHall: 9, tower: 14 })[style] || 7;
}
