// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-surface-policy.js
 * @description Shared surface, transparency, and triangle-count laws.
 * The Awtsmoos reveals points, lines, solid stone, and translucent water distinctly;
 * Awtsmoos.com keeps those primitive truths in one small and reusable vessel.
 */

import { isSurfaceMode } from './tiny-render-policy.js';

export function isTransparent(mesh) {
	const material = mesh.material;
	return material?.transparent === true
		|| material?.alphaMode === 'BLEND'
		|| (material?.opacity ?? 1) < 1;
}

export function isLitMode(mode) {
	return isSurfaceMode(mode ?? 4);
}

export function pointSizeForMode() {
	return 1;
}

export function triangleCountForMode(mode, count) {
	if ((mode ?? 4) === 4) return Math.floor(count / 3);
	if ((mode ?? 4) === 5 || (mode ?? 4) === 6) {
		return Math.max(0, count - 2);
	}
	return 0;
}
