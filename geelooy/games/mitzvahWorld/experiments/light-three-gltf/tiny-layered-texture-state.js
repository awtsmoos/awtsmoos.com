// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-layered-texture-state.js
 * @description Captures ten ecological layers with per-image native texel density.
 * The Awtsmoos reveals one terrain through many untouched images; Awtsmoos.com lets every
 * layer keep its own original dimensions while sharing one measured world-space scale.
 */

import {
	nativeTexturePolicySignature,
	resolveNativeTextureRepeat
} from './tiny-native-texture-density.js';
import { TERRAIN_LAYER_TARGET, terrainLayerUnits } from './tiny-terrain-layer-policy.js';
import { sourceReady } from './tiny-texture-source.js';

export const TERRAIN_LAYER_COUNT = TERRAIN_LAYER_TARGET;
export const TERRAIN_LAYER_UNITS = terrainLayerUnits(TERRAIN_LAYER_TARGET);

export function layeredTextureState(material = {}) {
	if (!Array.isArray(material.textureLayers)) return [];
	return Array.from({ length: TERRAIN_LAYER_COUNT }, (_, index) => (
		layerState(material.textureLayers[index] || {}, material)
	));
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
		layer.role,
		layer.angle,
		...layer.policySignature,
		...layer.zones,
		...layer.slope,
		...layer.height,
		layer.wetness
	]);
}

function layerState(layer, material) {
	const policy = { ...(material.texturePolicy || {}), ...(layer.texturePolicy || {}) };
	const repeat = resolveNativeTextureRepeat(layer.image, layer.repeat || [1, 1], policy);
	return {
		angle: finite(layer.angle, 0),
		height: pair(layer.height, [-10000, 10000]),
		image: layer.image || null,
		policySignature: nativeTexturePolicySignature(policy),
		ready: sourceReady(layer.image),
		repeat0: repeat[0],
		repeat1: repeat[1],
		role: layer.role || '',
		slope: pair(layer.slope, [0, 1]),
		strength: finite(layer.strength, 0),
		wetness: finite(layer.wetness, 0),
		zones: vector4(layer.zones)
	};
}

function sameLayer(left, right) {
	return Boolean(right)
		&& left.image === right.image
		&& left.ready === right.ready
		&& left.repeat0 === right.repeat0
		&& left.repeat1 === right.repeat1
		&& left.strength === right.strength
		&& left.role === right.role
		&& left.angle === right.angle
		&& sameArray(left.policySignature, right.policySignature)
		&& sameArray(left.zones, right.zones)
		&& sameArray(left.slope, right.slope)
		&& sameArray(left.height, right.height)
		&& left.wetness === right.wetness;
}

function pair(value, fallback) {
	if (!Array.isArray(value)) return [...fallback];
	return [finite(value[0], fallback[0]), finite(value[1], fallback[1])];
}

function vector4(value) {
	return Array.from({ length: 4 }, (_, index) => finite(value?.[index], 1));
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function sameArray(left, right) {
	return left.length === right.length && left.every((value, index) => value === right[index]);
}
