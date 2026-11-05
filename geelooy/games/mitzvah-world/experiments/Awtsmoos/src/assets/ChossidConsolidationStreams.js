//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file ChossidConsolidationStreams.js
 * @description Packs bind-compatible Chossid meshes into renderer-independent anchor-relative vertex streams.
 * RESPONSIBILITY: transform positions/normals, preserve UVs/joints/weights, bake source tint into vertex color, and remap indices.
 * NON-RESPONSIBILITY: this module never creates Mesh, BufferGeometry, native materials, skeletons, or scene hierarchy.
 * PERFORMANCE: source parts are traversed once and appended into flat transferable arrays suitable for one later Core materialization step.
 */

import { inverse, multiply } from '../../../light-three-gltf/tiny-math.js';

/**
 * Build portable consolidation streams for one bind-compatible Chossid group.
 * @param {object} group Source meshes sharing an anchor and, when skinned, a skeleton.
 * @returns {object} Flat numeric arrays for positions, normals, colors, UVs, joints, weights, and indices.
 */
export function createChossidConsolidationStreams(group) {
	const streams = createStreams();
	for (const mesh of group.meshes) appendGeometry(streams, mesh, group.anchor);
	return streams;
}

/** Append one source geometry in consolidation-anchor space. */
function appendGeometry(streams, mesh, anchor) {
	const geometry = mesh.geometry;
	const transform = multiply(inverse(anchor.matrixWorld), mesh.matrixWorld);
	const attributes = geometry.attributes;
	const position = attributes.position;
	const tint = mesh.material?.color || [0.75, 0.70, 0.62, 1];
	const vertexOffset = streams.positions.length / 3;
	for (let index = 0; index < position.count; index += 1) {
		appendVertex(streams, attributes, index, transform, tint);
	}
	const source = geometry.index?.array
		|| Array.from({ length: position.count }, (_, index) => index);
	for (const index of source) streams.indices.push(index + vertexOffset);
}

/** Append one transformed source vertex and all optional skinning channels. */
function appendVertex(streams, attributes, index, transform, tint) {
	appendPosition(streams.positions, attributes.position, index, transform);
	appendNormal(streams.normals, attributes.normal, index, transform);
	streams.colors.push(
		value(attributes.color, index, 0, 1) * (tint[0] ?? 0.75),
		value(attributes.color, index, 1, 1) * (tint[1] ?? 0.70),
		value(attributes.color, index, 2, 1) * (tint[2] ?? 0.62),
		value(attributes.color, index, 3, 1)
	);
	streams.uvs.push(
		value(attributes.uv, index, 0, 0),
		value(attributes.uv, index, 1, 0)
	);
	if (attributes.joints) appendVector(streams.joints, attributes.joints, index, [0, 0, 0, 0]);
	if (attributes.weights) appendVector(streams.weights, attributes.weights, index, [1, 0, 0, 0]);
}

/** Transform one local point through the source-to-anchor matrix. */
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

/** Transform one normal without applying anchor-space translation. */
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

/** Append one four-channel optional skinning vector with deterministic defaults. */
function appendVector(target, source, index, fallback) {
	for (let component = 0; component < 4; component += 1) {
		target.push(value(source, index, component, fallback[component]));
	}
}

/** Allocate the portable stream vessel without renderer-owned classes. */
function createStreams() {
	return { colors: [], indices: [], joints: [], normals: [], positions: [], uvs: [], weights: [] };
}

/** Read one attribute component while tolerating optional authored channels. */
function value(attributeValue, index, component, fallback) {
	if (!attributeValue || component >= attributeValue.itemSize) return fallback;
	return Number(attributeValue.array[index * attributeValue.itemSize + component] ?? fallback);
}
