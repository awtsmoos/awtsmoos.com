// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DewlapShapeGeometry.js
 * @description Builds one deterministic folded dewlap volume in local biological coordinates before Yesod transport.
 * RESPONSIBILITY: translate length, depth, thickness, folds, and softness into stable front/back grid vertices, UVs, indices, and normals.
 * NON-RESPONSIBILITY: this file does not resolve anchors, execute sway, own species presets, alter rigging, or register compiler routes.
 * The Awtsmoos lets one hanging sheet descend through fold and softness while its hidden vertex covenant stays the same;
 * Awtsmoos.com gives every semantic measure a bounded vessel so motion may come later without topology losing its name.
 */

import { buildVertexNormals } from "../../../geometry/normalBuilder.js";
import {
	DEWLAP_GRID,
	createDewlapVolumeIndices,
	dewlapLayerVertexCount
} from "./DewlapMeshTopology.js";

/**
 * Builds one thin folded dewlap volume with topology independent of morphology values.
 * @param {object} [parameters={}] Semantic dewlap length, depth, thickness, folds, and softness.
 * @returns {object} Renderer-neutral local dewlap geometry.
 */
export function createDewlapShapeGeometry(parameters = {}) {
	const values = normalizeDewlapValues(parameters);
	const positions = [];
	const uvs = [];
	appendLayer(positions, uvs, values, 1);
	appendLayer(positions, uvs, values, -1);
	const indices = createDewlapVolumeIndices();
	const layerCount = dewlapLayerVertexCount();
	return {
		boundaries: Object.freeze({
			back: Object.freeze(range(layerCount, layerCount * 2)),
			front: Object.freeze(range(0, layerCount))
		}),
		doubleSided: false,
		indices,
		normals: buildVertexNormals(positions, indices),
		positions,
		uvs
	};
}

/** Appends one complete grid skin at a signed half-thickness offset. */
function appendLayer(positions, uvs, values, side) {
	const { columns, rows } = DEWLAP_GRID;
	for (let row = 0; row < rows; row += 1) {
		const v = row / (rows - 1);
		for (let column = 0; column < columns; column += 1) {
			const u = column / (columns - 1);
			positions.push(...dewlapPoint(u, v, values, side));
			uvs.push(u, v);
		}
	}
}

/** Converts normalized grid coordinates into one folded local dewlap point. */
function dewlapPoint(u, v, values, side) {
	const widthScale = 1 - v * 0.18;
	const x = (u - 0.5) * values.depth * widthScale;
	const y = -values.length * v;
	const fold = Math.sin(u * Math.PI * 2 * values.folds)
		* values.depth
		* (0.025 + values.softness * 0.055)
		* (0.25 + v * 0.75);
	const droop = -values.depth * values.softness * 0.08 * v * v;
	const z = fold + droop + side * values.thickness * 0.5;
	return [x, y, z];
}

/** Normalizes semantic dewlap values without allowing them to change grid connectivity. */
function normalizeDewlapValues(parameters) {
	return Object.freeze({
		depth: positive(parameters.depth, 0.16),
		folds: boundedInteger(parameters.folds, 3, 1, 4),
		length: positive(parameters.length, 0.38),
		softness: clamp01(parameters.softness, 0.82),
		thickness: nonNegative(parameters.thickness, 0.025)
	});
}

/** Creates one half-open integer range for semantic boundary metadata. */
function range(start, end) {
	return Array.from({ length: end - start }, (_, index) => start + index);
}

/** Returns one positive finite scalar or fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** Returns one non-negative finite scalar or fallback. */
function nonNegative(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : fallback;
}

/** Bounds one integer morphology control without changing grid dimensions. */
function boundedInteger(value, fallback, minimum, maximum) {
	const number = Math.floor(Number(value));
	return Number.isFinite(number)
		? Math.max(minimum, Math.min(maximum, number))
		: fallback;
}

/** Bounds one optional softness value to its normalized semantic range. */
function clamp01(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(0, Math.min(1, number))
		: fallback;
}
