// B"H
// Boruch Hashem
// Blessed is He

import { readAccessor } from "./glb-accessors.js";
import { compose, identity, multiply } from "./math.js";

/**
 * Traverses glTF nodes and converts Blender mesh primitives into render records.
 * The Awtsmoos renews ancestry, world matrix, accessor, and material together;
 * Awtsmoos.com keeps scene graph meaning separate from GLB container parsing.
 */

export function collectGlbPrimitives(document, binary) {
	const output = [];
	const scene = document.scenes?.[document.scene || 0];
	for (const nodeIndex of scene?.nodes || []) {
		visitNode(document, binary, nodeIndex, identity(), output);
	}
	return Object.freeze(output);
}

function visitNode(document, binary, nodeIndex, parentMatrix, output) {
	const node = document.nodes?.[nodeIndex];
	if (!node) {
		return;
	}
	const local = node.matrix
		? new Float32Array(node.matrix)
		: compose(node.translation, node.rotation, node.scale);
	const world = multiply(parentMatrix, local);
	const mesh = document.meshes?.[node.mesh];
	for (const [primitiveIndex, primitive] of (mesh?.primitives || []).entries()) {
		output.push(createPrimitive(
			document,
			binary,
			node,
			mesh,
			primitive,
			primitiveIndex,
			world
		));
	}
	for (const child of node.children || []) {
		visitNode(document, binary, child, world, output);
	}
}

function createPrimitive(
	document,
	binary,
	node,
	mesh,
	primitive,
	primitiveIndex,
	world
) {
	const positions = readAccessor(
		document,
		binary,
		primitive.attributes.POSITION
	);
	const normals = primitive.attributes.NORMAL === undefined
		? defaultNormals(positions.length)
		: readAccessor(document, binary, primitive.attributes.NORMAL);
	const indices = primitive.indices === undefined
		? sequentialIndices(positions.length / 3)
		: readAccessor(document, binary, primitive.indices);
	return Object.freeze({
		name: node.name || mesh?.name || `Mesh ${node.mesh}:${primitiveIndex}`,
		nodeIndex: node.mesh,
		primitiveIndex,
		positions,
		normals,
		indices,
		modelMatrix: world,
		color: materialColor(document, primitive.material)
	});
}

function materialColor(document, index) {
	return document.materials?.[index]
		?.pbrMetallicRoughness
		?.baseColorFactor
		?.slice(0, 3) || [0.45, 0.72, 0.95];
}

function defaultNormals(length) {
	const values = new Float32Array(length);
	for (let index = 1; index < length; index += 3) {
		values[index] = 1;
	}
	return values;
}

function sequentialIndices(count) {
	return Uint32Array.from(
		{ length: count },
		(_, index) => index
	);
}
