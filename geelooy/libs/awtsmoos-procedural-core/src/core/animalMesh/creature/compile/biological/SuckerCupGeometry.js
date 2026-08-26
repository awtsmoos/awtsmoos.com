// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SuckerCupGeometry.js
 * @description Builds one explicit concave biological suction cup with rim, inner wall, and depressed floor.
 * RESPONSIBILITY: reveal reusable cup topology in local +Z-facing coordinates with stable indices and normals.
 * NON-RESPONSIBILITY: this vessel does not own cephalopods, adhesion simulation, pressure physics, tentacles, materials, or attachment frames.
 * The Awtsmoos hollows a cup where emptiness itself becomes a useful vessel, yet no octopus can own the geometric law;
 * Awtsmoos.com lets sucker, gripping organ, fantasy pore, or mechanical-biological seal appear wherever a semantic frame may draw.
 */

import { buildVertexNormals } from "../../../geometry/normalBuilder.js";
import { positiveAppendageNumber } from "./SoftAppendageNumbers.js";

const SEGMENTS = 12;

/** Creates one concave local cup centered at an optional finite XY origin. */
export function createSuckerCupGeometry(parameters = {}) {
	const radius = positiveAppendageNumber(parameters.radius, 0.012);
	const depth = positiveAppendageNumber(parameters.depth, radius * 0.7);
	const origin = validOrigin(parameters.origin);
	const positions = [];
	const uvs = [];
	createRing(positions, uvs, radius, 0, origin);
	createRing(positions, uvs, radius * 0.58, -depth * 0.48, origin);
	const centerIndex = positions.length / 3;
	positions.push(origin[0], origin[1], -depth);
	uvs.push(0.5, 0.5);
	const indices = createIndices(centerIndex);
	return {
		positions,
		indices,
		normals: buildVertexNormals(positions, indices),
		uvs,
		boundaries: { rim: Array.from({ length: SEGMENTS }, (_, index) => index) },
		doubleSided: true
	};
}

/** Appends one circular ring in the local XY plane. */
function createRing(positions, uvs, radius, z, origin) {
	for (let index = 0; index < SEGMENTS; index += 1) {
		const angle = index / SEGMENTS * Math.PI * 2;
		const cosine = Math.cos(angle);
		const sine = Math.sin(angle);
		positions.push(origin[0] + cosine * radius, origin[1] + sine * radius, z);
		uvs.push(0.5 + cosine * 0.5, 0.5 + sine * 0.5);
	}
}

/** Connects outer rim to inner rim, then closes the depressed cup floor. */
function createIndices(centerIndex) {
	const indices = [];
	for (let index = 0; index < SEGMENTS; index += 1) {
		const next = (index + 1) % SEGMENTS;
		const inner = SEGMENTS + index;
		const innerNext = SEGMENTS + next;
		indices.push(index, next, innerNext, index, innerNext, inner);
		indices.push(inner, innerNext, centerIndex);
	}
	return indices;
}

/** Accepts an XY origin while keeping cup depth in local Z. */
function validOrigin(origin) {
	return Array.isArray(origin) && origin.length >= 2 && origin.slice(0, 2).every(Number.isFinite)
		? [Number(origin[0]), Number(origin[1])]
		: [0, 0];
}
