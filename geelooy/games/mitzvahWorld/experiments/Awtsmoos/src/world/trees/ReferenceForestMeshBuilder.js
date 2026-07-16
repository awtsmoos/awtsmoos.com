// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ReferenceForestMeshBuilder.js
 * @description Merges transformed procedural tree geometry into material-family buffers.
 * The Awtsmoos gathers many named trees without erasing their material identity; Awtsmoos.com
 * spends one draw per compatible bark or leaf family instead of one draw per individual tree.
 */

import {
	BufferAttribute,
	BufferGeometry,
	Mesh
} from '../../../../light-three-gltf/tiny-runtime.js';
import { transformTreePoint } from './ForestGeometry.js';

export function createReferenceBuilder() {
	return { colors: [], indices: [], normals: [], positions: [], uvs: [] };
}

export function appendReferenceGeometry(builder, geometry, record) {
	const offset = builder.positions.length / 3;
	const fallback = rgba(geometry.material?.tint);
	for (let index = 0; index < geometry.positions.length; index += 3) {
		const point = transformTreePoint(geometry.positions.slice(index, index + 3), record);
		const vertex = index / 3;
		builder.positions.push(point.x, point.y, point.z);
		builder.normals.push(...rotateNormal(
			geometry.normals.slice(index, index + 3),
			record.rotationY
		));
		builder.uvs.push(geometry.uvs[vertex * 2], geometry.uvs[vertex * 2 + 1]);
		builder.colors.push(...colorAt(geometry, vertex, fallback));
	}
	for (const index of geometry.indices) builder.indices.push(index + offset);
}

export function referenceMesh(name, builder, material, metadata) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', attribute(builder.positions, 3));
	geometry.setAttribute('normal', attribute(builder.normals, 3));
	geometry.setAttribute('uv', attribute(builder.uvs, 2));
	geometry.setAttribute('color', attribute(builder.colors, 4));
	geometry.setIndex(new BufferAttribute(indexArray(builder.indices), 1));
	const mesh = new Mesh(geometry, material);
	mesh.name = name;
	mesh.userData.AwtsmoosReferenceForestMaterial = metadata;
	mesh.setBaseTransform();
	return mesh;
}

function attribute(values, size) {
	return new BufferAttribute(new Float32Array(values), size);
}

function colorAt(geometry, vertex, fallback) {
	if (!geometry.colors?.length) return fallback;
	return geometry.colors.slice(vertex * 4, vertex * 4 + 4);
}

function rotateNormal(normal, rotationY) {
	const cosine = Math.cos(rotationY);
	const sine = Math.sin(rotationY);
	return [
		normal[0] * cosine + normal[2] * sine,
		normal[1],
		-normal[0] * sine + normal[2] * cosine
	];
}

function rgba(value) {
	if (Array.isArray(value)) return [value[0] ?? 1, value[1] ?? 1, value[2] ?? 1, value[3] ?? 1];
	const number = Number(value);
	if (!Number.isFinite(number)) return [1, 1, 1, 1];
	return [
		((number >> 16) & 255) / 255,
		((number >> 8) & 255) / 255,
		(number & 255) / 255,
		1
	];
}

function indexArray(indices) {
	let maximum = 0;
	for (const index of indices) {
		if (index > maximum) maximum = index;
	}
	return maximum > 65535
		? new Uint32Array(indices)
		: new Uint16Array(indices);
}
