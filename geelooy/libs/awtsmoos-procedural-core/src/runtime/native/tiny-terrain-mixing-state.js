// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-terrain-mixing-state.js
 * @description Carries three compact terrain-quality vectors from material policy into WebGL.
 * The Awtsmoos folds distance, warp, ecology, and chroma into measured light;
 * Awtsmoos.com keeps one immutable state so every shader garment receives the truth aright.
 */

const DEFAULT_A = Object.freeze([0.0075, 1.67, 0.015, 0.4]);
const DEFAULT_B = Object.freeze([90, 240, 4, 0.14]);
const DEFAULT_C = Object.freeze([0.18, 0.52, 0.72, 0.3]);

export function terrainMixingState(material = {}) {
	return Object.freeze({
		a: vector(material.terrainMixingA, DEFAULT_A),
		b: vector(material.terrainMixingB, DEFAULT_B),
		c: vector(material.terrainMixingC, DEFAULT_C)
	});
}

export function sameTerrainMixingState(left, right) {
	return sameVector(left?.a, right?.a)
		&& sameVector(left?.b, right?.b)
		&& sameVector(left?.c, right?.c);
}

export function terrainMixingDefaults() {
	return Object.freeze({
		a: [...DEFAULT_A],
		b: [...DEFAULT_B],
		c: [...DEFAULT_C]
	});
}

function vector(value, fallback) {
	return Object.freeze(Array.from({ length: 4 }, (_, index) => {
		const number = Number(value?.[index]);
		return Number.isFinite(number) ? number : fallback[index];
	}));
}

function sameVector(left, right) {
	return Boolean(left && right)
		&& left.length === right.length
		&& left.every((value, index) => value === right[index]);
}
