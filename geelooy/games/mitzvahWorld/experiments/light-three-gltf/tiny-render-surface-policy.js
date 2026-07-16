// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-surface-policy.js
 * @description Shared alpha, culling, lighting, and triangle-count laws.
 * The Awtsmoos reveals solid stone, cutout leaves, and translucent water distinctly;
 * Awtsmoos.com keeps each surface in the pass whose depth and blending laws preserve it.
 */

import { isSurfaceMode } from './tiny-render-policy.js';

export function isAlphaMask(mesh) {
	return mesh?.material?.alphaMode === 'MASK';
}

export function isAlphaBlend(mesh) {
	return mesh?.material?.alphaMode === 'BLEND';
}

export function isTransparent(mesh) {
	const material = mesh?.material;
	if (material?.alphaMode === 'MASK') return false;
	if (material?.alphaMode === 'BLEND') return true;
	return material?.transparent === true || (material?.opacity ?? 1) < 1;
}

export function shouldCullBackfaces(mesh, transparent = isTransparent(mesh)) {
	const mode = mesh?.geometry?.mode ?? mesh?.primitiveMode ?? 4;
	if (!isSurfaceMode(mode)) return false;
	const material = mesh?.material || {};
	if (material.doubleSided === true) return false;
	if (material.backfaceCull === false) return false;
	return true;
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
