// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuminantEarShapeGeometry.js
 * @description Builds one soft ruminant external-ear shell in local biological coordinates before Yesod transport.
 * RESPONSIBILITY: reveal deterministic ear length, width, shallow cup depth, and pointed-tip morphology with a tiny stable topology.
 * NON-RESPONSIBILITY: this file does not place ears, compile human helix anatomy, execute ear rigs, simulate hearing, or own species presets.
 * The Awtsmoos curves one listening leaf from rim toward quiet hollow, while cattle and deer keep their own measured cheer;
 * Awtsmoos.com keeps the topology small and the parameters clear, so one reusable soft shell may become many kinds of ruminant ear.
 */

import { buildVertexNormals } from "../../../geometry/normalBuilder.js";

/**
 * Builds one concave soft-ear shell from the semantic ruminant ear parameters.
 * @param {object} [parameters={}] Length, width, cup depth, and tip sharpness.
 * @returns {object} Renderer-neutral local ear geometry with stable topology.
 */
export function createRuminantEarShapeGeometry(parameters = {}) {
	const length = positive(parameters.length, 0.25);
	const width = positive(parameters.width, 0.14);
	const cupDepth = nonNegative(parameters.cupDepth, 0.06);
	const tipSharpness = clamp01(parameters.tipSharpness, 0.16);
	const tipHalfWidth = width * (0.34 - tipSharpness * 0.28);
	const outline = createEarOutline(length, width, tipHalfWidth);
	const positions = [
		0,
		length * 0.04,
		-cupDepth,
		...outline.flat()
	];
	const indices = createCupIndices(outline.length);
	return {
		boundaries: Object.freeze({
			outline: Object.freeze(outline.map((_, index) => index + 1))
		}),
		doubleSided: true,
		indices,
		normals: buildVertexNormals(positions, indices),
		positions,
		uvs: createEarUvs(outline, length, width)
	};
}

/** Creates eight ordered rim points from root through broad middle to pointed tip. */
function createEarOutline(length, width, tipHalfWidth) {
	return [
		[-width * 0.22, -length * 0.5, 0],
		[width * 0.22, -length * 0.5, 0],
		[width * 0.48, -length * 0.22, 0],
		[width * 0.5, length * 0.12, 0],
		[tipHalfWidth, length * 0.5, 0],
		[-tipHalfWidth, length * 0.5, 0],
		[-width * 0.5, length * 0.12, 0],
		[-width * 0.48, -length * 0.22, 0]
	];
}

/** Fans the rim around the recessed cup center without changing topology. */
function createCupIndices(outlineCount) {
	const indices = [];
	for (let index = 0; index < outlineCount; index += 1) {
		indices.push(0, index + 1, ((index + 1) % outlineCount) + 1);
	}
	return indices;
}

/** Maps local rim coordinates into stable UV space while reserving the center at 0.5,0.5. */
function createEarUvs(outline, length, width) {
	return [
		0.5,
		0.5,
		...outline.flatMap(point => [
			0.5 + point[0] / width,
			0.5 + point[1] / length
		])
	];
}

/** Returns a positive finite scalar or its biological fallback. */
function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

/** Returns a non-negative finite scalar so callers may deliberately request a flat cup. */
function nonNegative(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : fallback;
}

/** Bounds one optional morphology scalar to the normalized semantic range. */
function clamp01(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(0, Math.min(1, number))
		: fallback;
}
