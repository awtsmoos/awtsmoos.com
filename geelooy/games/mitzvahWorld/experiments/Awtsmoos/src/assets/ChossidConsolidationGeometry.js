// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ChossidConsolidationGeometry.js
 * @description Merges one bind-compatible Chossid group with RGB tint baked into vertex color.
 * The Awtsmoos preserves skeleton, joints, weights, parent space, and visible hue while
 * Awtsmoos.com turns nine solid-color body materials into one neutral skinned draw vessel.
 */
import { BufferAttribute, BufferGeometry, Mesh } from '../../../light-three-gltf/tiny-runtime.js';
import { inverse, multiply } from '../../../light-three-gltf/tiny-math.js';
import { createStaticBatchMaterial } from '../../../light-three-gltf/tiny-static-batch-material.js';

export function buildChossidConsolidatedMesh(group) {
	if (!group.meshes.length) return null;
	const streams = createStreams();
	for (const mesh of group.meshes) appendGeometry(streams, mesh, group.anchor);
	if (streams.positions.length < 9) return null;
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', attribute(streams.positions, 3));
	geometry.setAttribute('normal', attribute(streams.normals, 3));
	geometry.setAttribute('color', attribute(streams.colors, 4));
	geometry.setAttribute('uv', attribute(streams.uvs, 2));
	if (group.skinned) {
		geometry.setAttribute('joints', attribute(streams.joints, 4));
		geometry.setAttribute('weights', attribute(streams.weights, 4));
	}
	geometry.setIndex(new BufferAttribute(indexArray(streams.indices), 1));
	const batch = new Mesh(geometry, createStaticBatchMaterial(group.meshes[0].material));
	batch.name = `AwtsmoosChossidBatch:${group.skinned ? 'skin' : 'rigid'}:${group.meshes.length}`;
	batch.isSkinnedMesh = group.skinned;
	batch.skeleton = group.skeleton;
	batch.userData.AwtsmoosChossidConsolidation = {
		anchor: group.anchor?.name || 'root',
		members: group.meshes.length,
		skinned: group.skinned,
		tintBakedIntoVertexColor: true,
		triangles: streams.indices.length / 3,
		vertices: streams.positions.length / 3
	};
	batch.setBaseTransform();
	return batch;
}

function appendGeometry(streams, mesh, anchor) {
	const geometry = mesh.geometry;
	const transform = multiply(inverse(anchor.matrixWorld), mesh.matrixWorld);
	const position = geometry.attributes.position;
	const normal = geometry.attributes.normal;
	const color = geometry.attributes.color;
	const uv = geometry.attributes.uv;
	const joints = geometry.attributes.joints;
	const weights = geometry.attributes.weights;
	const tint = mesh.material?.color || [0.75, 0.70, 0.62, 1];
	const vertexOffset = streams.positions.length / 3;
	for (let index = 0; index < position.count; index += 1) {
		appendPosition(streams.positions, position, index, transform);
		appendNormal(streams.normals, normal, index, transform);
		streams.colors.push(
			value(color, index, 0, 1) * (tint[0] ?? 0.75),
			value(color, index, 1, 1) * (tint[1] ?? 0.70),
			value(color, index, 2, 1) * (tint[2] ?? 0.62),
			value(color, index, 3, 1)
		);
		streams.uvs.push(value(uv, index, 0, 0), value(uv, index, 1, 0));
		if (joints) appendVector(streams.joints, joints, index, [0, 0, 0, 0]);
		if (weights) appendVector(streams.weights, weights, index, [1, 0, 0, 0]);
	}
	const source = geometry.index?.array || Array.from({ length: position.count }, (_, index) => index);
	for (const index of source) streams.indices.push(index + vertexOffset);
}

function appendPosition(target, source, index, matrix) {
	const x = value(source, index, 0, 0);
	const y = value(source, index, 1, 0);
	const z = value(source, index, 2, 0);
	target.push(
		matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
		matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
		matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]
	);
}

function appendNormal(target, source, index, matrix) {
	const x = value(source, index, 0, 0);
	const y = value(source, index, 1, 1);
	const z = value(source, index, 2, 0);
	target.push(
		matrix[0] * x + matrix[4] * y + matrix[8] * z,
		matrix[1] * x + matrix[5] * y + matrix[9] * z,
		matrix[2] * x + matrix[6] * y + matrix[10] * z
	);
}
function appendVector(target, source, index, fallback) {
	for (let component = 0; component < 4; component += 1) {
		target.push(value(source, index, component, fallback[component]));
	}
}
function createStreams() {
	return { colors: [], indices: [], joints: [], normals: [], positions: [], uvs: [], weights: [] };
}
function attribute(values, size) {
	return new BufferAttribute(new Float32Array(values), size);
}
function value(attributeValue, index, component, fallback) {
	if (!attributeValue || component >= attributeValue.itemSize) return fallback;
	return Number(attributeValue.array[index * attributeValue.itemSize + component] ?? fallback);
}
function indexArray(indices) {
	let maximum = 0;
	for (const index of indices) if (index > maximum) maximum = index;
	return maximum > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
}
