//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file ForestGeometryBuffer.js
 * @description Converts semantic tree-generator output into portable merged forest batches while Core owns native renderer materialization.
 * RESPONSIBILITY: transform tree-local vertices into deterministic world-space batch arrays and preserve forest-layer evidence.
 * NON-RESPONSIBILITY: this module does not construct BufferGeometry, BufferAttribute, Mesh, materials, trees, or placement policy.
 * PERFORMANCE: arrays are merged by semantic family before one Core native mesh is created, keeping draw calls bounded by material families.
 */

import {
	createNativeGeometryMesh
} from '../../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';

/**
 * Append one generated tree layer into a semantic family batch.
 * @param {object} builder Mutable portable arrays owned by the current forest build.
 * @param {object} geometry Procedural Core tree geometry in local tree space.
 * @param {object} record Deterministic placement, rotation, and scale evidence.
 * @param {number[]} fallbackColor RGBA used only when generated vertices carry no explicit color.
 */
export function appendTreeGeometry(builder, geometry, record, fallbackColor) {
	const offset = builder.positions.length / 3;
	for (let index = 0; index < geometry.positions.length; index += 3) {
		appendTreeVertex(builder, geometry, record, fallbackColor, index);
	}
	for (const index of geometry.indices) builder.indices.push(index + offset);
}

/**
 * Materialize one merged forest family through Core's renderer boundary.
 * Leaves remain concealed until a genuine remote alpha image is resident; bark visibility follows the shared scene material covenant.
 * @param {string} name Stable semantic batch identity.
 * @param {object} builder Portable merged positions, normals, UVs, colors, and indices.
 * @param {object} material Core-owned native material selected from game-side semantic species data.
 * @returns {object} Native Core mesh carrying forest-layer diagnostics.
 */
export function createForestMesh(name, builder, material) {
	const layer = material.userData?.AwtsmoosForestMaterial;
	const mesh = createNativeGeometryMesh(builder, material, {
		family: 'forest-semantic-batch',
		name,
		userData: { AwtsmoosForestLayer: layer }
	});
	mesh.visible = layer?.layer !== 'leaves' || Boolean(material.mapImage);
	mesh.setBaseTransform();
	return mesh;
}

/** Create an empty portable batch accumulator with no renderer dependencies. */
export function emptyForestBuilder() {
	return { colors: [], indices: [], normals: [], positions: [], uvs: [] };
}

/** Normalize numeric or explicit RGBA material tint into four finite channels. */
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

/** Transform one local tree point into deterministic world coordinates for its placement record. */
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

/** Append one transformed vertex and its renderer-independent attributes into the current family batch. */
function appendTreeVertex(builder, geometry, record, fallbackColor, index) {
	const point = transformTreePoint(geometry.positions.slice(index, index + 3), record);
	const vertex = index / 3;
	const colorOffset = vertex * 4;
	builder.positions.push(point.x, point.y, point.z);
	builder.normals.push(...transformNormal(geometry.normals.slice(index, index + 3), record.rotationY));
	builder.uvs.push(geometry.uvs[vertex * 2], geometry.uvs[vertex * 2 + 1]);
	builder.colors.push(...(geometry.colors?.length
		? geometry.colors.slice(colorOffset, colorOffset + 4)
		: fallbackColor));
}

/** Rotate one local normal around the tree's Y axis without applying translation or scale. */
function transformNormal(normal, rotationY) {
	const cosine = Math.cos(rotationY);
	const sine = Math.sin(rotationY);
	return [
		normal[0] * cosine + normal[2] * sine,
		normal[1],
		-normal[0] * sine + normal[2] * cosine
	];
}
