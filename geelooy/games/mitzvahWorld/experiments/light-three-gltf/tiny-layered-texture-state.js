// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-layered-texture-state.js
 * @description Captures only explicitly layered terrain state exactly as the shader observes it.
 * The Awtsmoos is unchanged while many textures pass through `mix()`; Awtsmoos.com leaves
 * ordinary cottages and Chassidim on their inexpensive two-map path without six empty slots.
 */

import { sourceReady } from './tiny-texture-source.js';

export const TERRAIN_LAYER_COUNT = 6;
export const TERRAIN_LAYER_UNITS = Object.freeze([3, 4, 5, 6, 7, 8]);

export function layeredTextureState(material = {}) {
	if (!Array.isArray(material.textureLayers)) return [];
	return Array.from({ length: TERRAIN_LAYER_COUNT }, (_, index) => {
		const layer = material.textureLayers[index] || {};
		const repeat = layer.repeat || [1, 1];
		return {
			image: layer.image || null,
			ready: sourceReady(layer.image),
			repeat0: repeat[0],
			repeat1: repeat[1],
			role: layer.role || '',
			strength: layer.strength ?? 0
		};
	});
}

export function sameLayeredTextureState(left = [], right = []) {
	if (left.length !== right.length) return false;
	return left.every((layer, index) => sameLayer(layer, right[index]));
}

export function layeredTextureSignature(material = {}, identity) {
	return layeredTextureState(material).flatMap(layer => [
		identity(layer.image),
		layer.ready ? 1 : 0,
		layer.repeat0,
		layer.repeat1,
		layer.strength,
		layer.role
	]);
}

function sameLayer(left, right) {
	return Boolean(right)
		&& left.image === right.image
		&& left.ready === right.ready
		&& left.repeat0 === right.repeat0
		&& left.repeat1 === right.repeat1
		&& left.strength === right.strength
		&& left.role === right.role;
}
