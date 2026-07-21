// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ForestGeometryBuffer.js
 * @description Transforms procedural-core tree geometry into renderer-ready merged buffers.
 * The Awtsmoos carries every branch from abstract seed into measured place; Awtsmoos.com
 * rotates, scales, colors, indexes, and exposes collision transforms without generating trees.
 */

import {
	BufferAttribute,
	BufferGeometry,
	Mesh
} from '../../../../light-three-gltf/tiny-runtime.js';

export function appendTreeGeometry(builder, geometry, record, fallbackColor) {
	const offset = builder.positions.length / 3;
	for (let index = 0; index < geometry.positions.length; index += 3) {
		const point = transformTreePoint(geometry.positions.slice(index, index + 3), record);
		const vertex = index / 3;
		const colorOffset = vertex * 4;
		builder.positions.push(point.x, point.y, point.z);
		builder.normals.push(...transformNormal(
			geometry.normals.slice(index, index + 3),
			record.rotationY
		));
		builder.uvs.push(geometry.uvs[vertex * 2], geometry.uvs[vertex * 2 + 1]);
		builder.colors.push(...(
			geometry.colors?.length
				? geometry.colors.slice(colorOffset, colorOffset + 4)
				: fallbackColor
		));
	}
	for (const index of geometry.indices) builder.indices.push(index + offset);
}

export function createForestMesh(name, builder, material) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(builder.positions), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array(builder.normals), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(builder.uvs), 2));
	geometry.setAttribute('color', new BufferAttribute(new Float32Array(builder.colors), 4));
	geometry.setIndex(new BufferAttribute(indexArray(builder.indices), 1));
	const mesh = new Mesh(geometry, material);
	mesh.name = name;
	mesh.visible = material.userData?.AwtsmoosForestMaterial?.layer !== 'leaves'
		|| !!material.mapImage;
	mesh.userData.AwtsmoosForestLayer = material.userData.AwtsmoosForestMaterial;
	mesh.setBaseTransform();
	return mesh;
}

export function emptyForestBuilder() {
	return { colors: [], indices: [], normals: [], positions: [], uvs: [] };
}

export function rgba(value) {
	if (Array.isArray(value)) {
		return [value[0] ?? 1, value[1] ?? 1, value[2] ?? 1, value[3] ?? 1];
	}
	const number = Number(value);
	if (!Number.isFinite(number)) return [1, 1, 1, 1];
	return [
		((number >> 16) & 255) / 255,
		((number >> 8) & 255) / 255,
		(number & 255) / 255,
		1
	];
}

export function transformTreePoint(position, record) {
	const cosine = Math.cos(record.rotationY);
	const sine = Math.sin(record.rotationY);
	const x = position[0] * record.scale;
	const z = position[2] * record.scale;
	return {
		x: record.x + x * cosine + z * sine,
		y: record.y + position[1] * record.scale,
		z: record.z - x * sine + z * cosine
	};
}

function transformNormal(normal, rotationY) {
	const cosine = Math.cos(rotationY);
	const sine = Math.sin(rotationY);
	return [
		normal[0] * cosine + normal[2] * sine,
		normal[1],
		-normal[0] * sine + normal[2] * cosine
	];
}

function indexArray(indices) {
	let maximum = 0;
	for (const index of indices) maximum = Math.max(maximum, index);
	return maximum > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
}
