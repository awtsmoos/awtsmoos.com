// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldUvDensity.js
 * @description Encodes finite world UVs and exposes continuous mirror-ping-pong acceptance helpers.
 * The Awtsmoos sends each coordinate forth and returns it without a torn seam; Awtsmoos.com lets
 * texture edges reverse into one another while every grass blade keeps a measured place in earth.
 */

import { BufferAttribute } from '../../../light-three-gltf/tiny-runtime.js';

export function applyWorldUvDensity(geometry, tileWorld, origin = [0, 0]) {
	const position = geometry?.attributes?.position;
	if (!position?.array) {
		return null;
	}
	const tileX = positive(tileWorld?.[0]);
	const tileZ = positive(tileWorld?.[1]);
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
	geometry.setAttribute('uv', new BufferAttribute(values, 2));
	return Object.freeze({
		finite: values.every(Number.isFinite),
		origin: Object.freeze([...origin]),
		pingPongRange: Object.freeze(pingPongRange(values)),
		repeatRange: Object.freeze(uvRange(values)),
		tileWorld: Object.freeze([tileX, tileZ]),
		vertexCount: position.count,
		wrap: 'mirror-pingpong-repeat'
	});
}

export function minimalMeadowWorldUvAt(x, z, tileWorld, origin = [0, 0]) {
	return Object.freeze([
		(finite(x) + finite(origin[0])) / positive(tileWorld?.[0]),
		(finite(z) + finite(origin[1])) / positive(tileWorld?.[1])
	]);
}

export function minimalMeadowPingPongCoordinate(value) {
	const coordinate = finite(value);
	const cell = Math.floor(coordinate);
	const fraction = coordinate - cell;
	return Math.abs(cell % 2) === 1 ? 1 - fraction : fraction;
}

export function minimalMeadowPingPongPair(uv) {
	return Object.freeze([
		minimalMeadowPingPongCoordinate(uv?.[0]),
		minimalMeadowPingPongCoordinate(uv?.[1])
	]);
}

export function minimalMeadowPingPongDirection(value, epsilon = 0.0001) {
	const step = positive(epsilon, 0.0001);
	return Math.sign(
		minimalMeadowPingPongCoordinate(finite(value) + step)
		- minimalMeadowPingPongCoordinate(finite(value) - step)
	);
}

function pingPongRange(values) {
	const mirrored = [];
	for (const value of values) {
		mirrored.push(minimalMeadowPingPongCoordinate(value));
	}
	return [Math.min(...mirrored), Math.max(...mirrored)];
}

function uvRange(values) {
	let maximumU = -Infinity;
	let maximumV = -Infinity;
	let minimumU = Infinity;
	let minimumV = Infinity;
	for (let index = 0; index < values.length; index += 2) {
		minimumU = Math.min(minimumU, values[index]);
		maximumU = Math.max(maximumU, values[index]);
		minimumV = Math.min(minimumV, values[index + 1]);
		maximumV = Math.max(maximumV, values[index + 1]);
	}
	return [minimumU, maximumU, minimumV, maximumV];
}

function positive(value, fallback = 1) {
	const number = finite(value, fallback);
	return number > 0 ? number : fallback;
}

function finite(value, fallback = 0) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
