// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCreatureGeometry.js
 * @description Builds reusable smooth sphere and tapered-limb geometry for articulated creatures.
 * The Awtsmoos reveals head, hand, horn, torso, and foot from measured curves;
 * Awtsmoos.com keeps every reusable primitive indexed, UV-mapped, and renderer-native.
 */

import { BufferAttribute, BufferGeometry } from '../../../light-three-gltf/tiny-runtime.js';

const sphereCache = new Map();
const limbCache = new Map();

export function creatureSphereGeometry(segments = 14, rings = 10) {
	const key = `${segments}:${rings}`;
	if (!sphereCache.has(key)) sphereCache.set(key, createSphere(segments, rings));
	return sphereCache.get(key);
}

export function creatureLimbGeometry(segments = 10, topRadius = 0.72) {
	const key = `${segments}:${topRadius}`;
	if (!limbCache.has(key)) limbCache.set(key, createLimb(segments, topRadius));
	return limbCache.get(key);
}

function createSphere(segments, rings) {
	const data = emptyData();
	for (let ring = 0; ring <= rings; ring += 1) {
		const v = ring / rings;
		const phi = v * Math.PI;
		for (let segment = 0; segment <= segments; segment += 1) {
			const u = segment / segments;
			const theta = u * Math.PI * 2;
			const x = Math.sin(phi) * Math.cos(theta);
			const y = Math.cos(phi);
			const z = Math.sin(phi) * Math.sin(theta);
			pushVertex(data, x, y, z, x, y, z, u, 1 - v);
		}
	}
	gridIndices(data.indices, rings, segments);
	return geometry(data);
}

function createLimb(segments, topRadius) {
	const data = emptyData();
	for (let row = 0; row <= 1; row += 1) {
		const radius = row ? topRadius : 1;
		const y = row - 0.5;
		for (let segment = 0; segment <= segments; segment += 1) {
			const u = segment / segments;
			const angle = u * Math.PI * 2;
			const x = Math.cos(angle) * radius;
			const z = Math.sin(angle) * radius;
			pushVertex(data, x, y, z, Math.cos(angle), 0.2, Math.sin(angle), u, row);
		}
	}
	gridIndices(data.indices, 1, segments);
	cap(data, segments, -0.5, 1, true);
	cap(data, segments, 0.5, topRadius, false);
	return geometry(data);
}

function cap(data, segments, y, radius, reverse) {
	const center = data.positions.length / 3;
	pushVertex(data, 0, y, 0, 0, reverse ? -1 : 1, 0, 0.5, 0.5);
	for (let segment = 0; segment <= segments; segment += 1) {
		const angle = segment / segments * Math.PI * 2;
		pushVertex(data, Math.cos(angle) * radius, y, Math.sin(angle) * radius, 0, reverse ? -1 : 1, 0, 0.5, 0.5);
		if (segment) {
			const first = center + segment;
			data.indices.push(...(reverse ? [center, first + 1, first] : [center, first, first + 1]));
		}
	}
}

function gridIndices(indices, rows, segments) {
	for (let row = 0; row < rows; row += 1) {
		for (let segment = 0; segment < segments; segment += 1) {
			const first = row * (segments + 1) + segment;
			const next = first + segments + 1;
			indices.push(first, next, first + 1, first + 1, next, next + 1);
		}
	}
}

function pushVertex(data, x, y, z, nx, ny, nz, u, v) {
	data.positions.push(x, y, z);
	data.normals.push(nx, ny, nz);
	data.uvs.push(u, v);
}

function emptyData() {
	return { indices: [], normals: [], positions: [], uvs: [] };
}

function geometry(data) {
	const value = new BufferGeometry();
	value.setAttribute('position', new BufferAttribute(new Float32Array(data.positions), 3));
	value.setAttribute('normal', new BufferAttribute(new Float32Array(data.normals), 3));
	value.setAttribute('uv', new BufferAttribute(new Float32Array(data.uvs), 2));
	value.setIndex(new BufferAttribute(new Uint16Array(data.indices), 1));
	return value;
}
