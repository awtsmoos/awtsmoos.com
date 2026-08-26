// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BiologicalGeometryFrame.js
 * @description Transports local biological geometry through a stable Yesod surface frame.
 * The Awtsmoos lets one eye face outward on flesh, stone, fin, or wall;
 * Awtsmoos.com carries local form through tangent, normal, and binormal so anatomy may travel yet remain itself through all.
 */

import { buildVertexNormals } from "../../../geometry/normalBuilder.js";
import {
	addVector,
	normalizeVector,
	scaleVector
} from "../../../geometry/vectorMath.js";

/**
 * Transforms local geometry into a resolved Yesod anchor frame.
 * @param {object} geometry Renderer-neutral local geometry.
 * @param {object} resolved Result of resolveSurfaceAnchor.
 * @param {object} part Briah part carrying local transform.
 * @returns {object} Geometry expressed in creature/world coordinates.
 */
export function transformBiologicalGeometry(geometry, resolved, part = {}) {
	const frame = normalizedFrame(resolved?.frame);
	const transform = normalizedTransform(part.transform);
	const positions = [];
	for (let index = 0; index < geometry.positions.length; index += 3) {
		const localPoint = [
			geometry.positions[index],
			geometry.positions[index + 1],
			geometry.positions[index + 2]
		];
		positions.push(...toWorldPoint(localPoint, resolved?.position, frame, transform));
	}
	return {
		...geometry,
		positions,
		normals: buildVertexNormals(positions, geometry.indices)
	};
}

/** Maps one local point through scale, Euler rotation, local offset, and Yesod basis. */
function toWorldPoint(point, anchorPosition, frame, transform) {
	const scaled = point.map((value, index) => value * transform.scale[index]);
	const rotated = rotateEuler(scaled, transform.rotation);
	const local = addVector(rotated, transform.position);
	let world = [...(anchorPosition || [0, 0, 0])];
	world = addVector(world, scaleVector(frame.binormal, local[0]));
	world = addVector(world, scaleVector(frame.tangent, local[1]));
	return addVector(world, scaleVector(frame.normal, local[2]));
}

/** Applies intrinsic XYZ Euler rotations without depending on a renderer math library. */
function rotateEuler(point, rotation) {
	const [x, y, z] = rotation;
	const [sx, cx] = [Math.sin(x), Math.cos(x)];
	const [sy, cy] = [Math.sin(y), Math.cos(y)];
	const [sz, cz] = [Math.sin(z), Math.cos(z)];
	const aroundX = [point[0], point[1] * cx - point[2] * sx, point[1] * sx + point[2] * cx];
	const aroundY = [aroundX[0] * cy + aroundX[2] * sy, aroundX[1], -aroundX[0] * sy + aroundX[2] * cy];
	return [
		aroundY[0] * cz - aroundY[1] * sz,
		aroundY[0] * sz + aroundY[1] * cz,
		aroundY[2]
	];
}

/** Normalizes a transported frame defensively while preserving its semantic axes. */
function normalizedFrame(frame = {}) {
	return {
		tangent: normalizeVector(frame.tangent || [0, 1, 0], [0, 1, 0]),
		normal: normalizeVector(frame.normal || [0, 0, 1], [0, 0, 1]),
		binormal: normalizeVector(frame.binormal || [1, 0, 0], [1, 0, 0])
	};
}

/** Returns finite local transform vectors with historical neutral defaults. */
function normalizedTransform(transform = {}) {
	return {
		position: vector3(transform.position, [0, 0, 0]),
		rotation: vector3(transform.rotation, [0, 0, 0]),
		scale: vector3(transform.scale, [1, 1, 1])
	};
}

/** Converts a value into a finite vector without mutating caller data. */
function vector3(value, fallback) {
	return [0, 1, 2].map(index => {
		const number = Number(value?.[index]);
		return Number.isFinite(number) ? number : fallback[index];
	});
}
