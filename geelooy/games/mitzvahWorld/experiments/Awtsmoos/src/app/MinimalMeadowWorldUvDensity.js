//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MinimalMeadowWorldUvDensity.js
 * @description Projects semantic world meters into UV space while Procedural Core owns native attribute mutation.
 * MitzvahWorld decides density, origin, and mirror-repeat behavior; renderer-neutral math lives in a focused submodule,
 * and Core alone constructs the native UV attribute. The public API remains deterministic, finite, and allocation-bounded.
 */

import {
	replaceNativeGeometryAttribute
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import {
	finiteWorldNumber,
	positiveWorldNumber,
	worldUvPingPongCoordinate,
	worldUvPingPongRange,
	worldUvRepeatRange
} from './worldUv/WorldUvMath.js';

/**
 * Applies world-space UV density to an existing geometry without taking renderer-constructor ownership.
 * @param {object} geometry Geometry containing a position attribute.
 * @param {number[]} tileWorld World-meter width/depth represented by one texture tile.
 * @param {number[]} origin Optional world X/Z offset.
 * @returns {Readonly<object>|null} Frozen diagnostic receipt, or null when positions are unavailable.
 */
export function applyWorldUvDensity(geometry, tileWorld, origin = [0, 0]) {
	const position = geometry?.attributes?.position;
	if (!position?.array) {
		return null;
	}
	const tileX = positiveWorldNumber(tileWorld?.[0]);
	const tileZ = positiveWorldNumber(tileWorld?.[1]);
	const values = new Float32Array(position.count * 2);
	for (let index = 0; index < position.count; index += 1) {
		const source = index * position.itemSize;
		const uv = minimalMeadowWorldUvAt(
			position.array[source],
			position.array[source + 2],
			[tileX, tileZ],
			origin
		);
		values[index * 2] = uv[0];
		values[index * 2 + 1] = uv[1];
	}
	replaceNativeGeometryAttribute(geometry, 'uv', values, 2);
	return Object.freeze({
		finite: values.every(Number.isFinite),
		origin: Object.freeze([...origin]),
		pingPongRange: Object.freeze(worldUvPingPongRange(values)),
		repeatRange: Object.freeze(worldUvRepeatRange(values)),
		tileWorld: Object.freeze([tileX, tileZ]),
		vertexCount: position.count,
		wrap: 'mirror-pingpong-repeat'
	});
}

/**
 * Resolves one world X/Z point into repeat-space UV coordinates without clamping.
 * @returns {ReadonlyArray<number>} Frozen U/V pair.
 */
export function minimalMeadowWorldUvAt(x, z, tileWorld, origin = [0, 0]) {
	return Object.freeze([
		(finiteWorldNumber(x) + finiteWorldNumber(origin[0]))
			/ positiveWorldNumber(tileWorld?.[0]),
		(finiteWorldNumber(z) + finiteWorldNumber(origin[1]))
			/ positiveWorldNumber(tileWorld?.[1])
	]);
}

/** Mirrors one repeat-space coordinate into the continuous zero-to-one interval. */
export function minimalMeadowPingPongCoordinate(value) {
	return worldUvPingPongCoordinate(value);
}

/** Mirrors one U/V pair without mutating caller-owned storage. */
export function minimalMeadowPingPongPair(uv) {
	return Object.freeze([
		worldUvPingPongCoordinate(uv?.[0]),
		worldUvPingPongCoordinate(uv?.[1])
	]);
}

/** Measures local mirror direction around one repeat-space coordinate. */
export function minimalMeadowPingPongDirection(value, epsilon = 0.0001) {
	const step = positiveWorldNumber(epsilon, 0.0001);
	return Math.sign(
		worldUvPingPongCoordinate(finiteWorldNumber(value) + step)
		- worldUvPingPongCoordinate(finiteWorldNumber(value) - step)
	);
}
