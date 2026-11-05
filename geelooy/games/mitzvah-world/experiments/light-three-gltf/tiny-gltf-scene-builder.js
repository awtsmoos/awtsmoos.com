// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-gltf-scene-builder.js
 * @description Builds tiny GLTF nodes, meshes, and transforms from parsed document data without owning diagnostics.
 * The Awtsmoos gives every authored node its measured place while Awtsmoos.com keeps scene construction separate
 * from explanation, so the canonical Chossid stays small in responsibility while its structure remains fully inspectable elsewhere.
 */

import { normalizeWeightsAttribute } from './tiny-gltf-accessors.js';
import { defaultTinyMaterial } from './tiny-gltf-materials.js';
import { mat4FromArray } from './tiny-math.js';
import {
	Bone,
	BufferGeometry,
	Group,
	Mesh
} from './tiny-runtime.js';

const ATTRIBUTES = Object.freeze({
	POSITION: 'position',
	NORMAL: 'normal',
	TEXCOORD_0: 'uv',
	COLOR_0: 'color',
	JOINTS_0: 'joints',
	WEIGHTS_0: 'weights'
});

/** Builds the node graph while sharing parsed accessors and immutable geometry/material vessels. */
export function buildTinyGltfScene(document, materials, getAccessor, stats) {
	const bones = collectBoneIndices(document);
	const nodeMap = new Map();
	const nodes = (document.nodes || []).map((definition = {}, index) => {
		const node = bones.has(index) ? new Bone() : new Group();
		applyNodeTransform(node, definition, index);
		nodeMap.set(index, node);
		stats.nodes += 1;
		if (definition.skin !== undefined) stats.skinnedNodes += 1;
		return node;
	});
	attachMeshes(document, nodes, materials, getAccessor, stats);
	attachChildren(document, nodes);
	return { nodeMap, nodes };
}

function attachMeshes(document, nodes, materials, getAccessor, stats) {
	for (let index = 0; index < nodes.length; index += 1) {
		const definition = document.nodes[index] || {};
		const meshDefinition = document.meshes?.[definition.mesh];
		if (!meshDefinition) continue;
		(meshDefinition.primitives || []).forEach((primitive, primitiveIndex) => {
			const mesh = primitiveMesh(materials, getAccessor, primitive, meshDefinition, definition, primitiveIndex);
			mesh.nodeIndex = index;
			mesh.setBaseTransform();
			nodes[index].add(mesh);
			stats.meshes += 1;
			stats.primitives += 1;
			if (mesh.skinIndex !== null && mesh.geometry.attributes.joints && mesh.geometry.attributes.weights) {
				stats.skinnedPrimitives += 1;
			}
		});
	}
}

function primitiveMesh(materials, getAccessor, primitive, meshDefinition, nodeDefinition, primitiveIndex) {
	const geometry = new BufferGeometry();
	geometry.mode = primitive.mode ?? 4;
	geometry.userData = { primitive, primitiveIndex };
	for (const [semantic, accessorIndex] of Object.entries(primitive.attributes || {})) {
		const key = ATTRIBUTES[semantic];
		if (!key) continue;
		const source = getAccessor(accessorIndex);
		geometry.setAttribute(key, key === 'weights' ? normalizeWeightsAttribute(source) : source);
	}
	if (primitive.indices !== undefined) geometry.setIndex(getAccessor(primitive.indices));
	const material = primitive.material !== undefined ? materials[primitive.material] : defaultTinyMaterial();
	const mesh = new Mesh(geometry, material);
	mesh.name = meshDefinition.name || nodeDefinition.name || `mesh_${nodeDefinition.mesh}_${primitiveIndex}`;
	mesh.skinIndex = nodeDefinition.skin ?? null;
	mesh.primitiveMode = geometry.mode;
	mesh.userData = { meshDef: meshDefinition, primitive, primitiveIndex };
	return mesh;
}

function applyNodeTransform(node, definition, index) {
	node.userData.nodeIndex = index;
	node.userData.gltfNode = definition;
	if (definition.name) {
		node.name = definition.name;
		node.userData.name = definition.name;
	}
	if (definition.matrix) node.matrix = mat4FromArray(definition.matrix);
	else {
		if (definition.translation) node.position.fromArray(definition.translation);
		if (definition.rotation) node.quaternion.fromArray(definition.rotation);
		if (definition.scale) node.scale.fromArray(definition.scale);
	}
	node.setBaseTransform();
}

function attachChildren(document, nodes) {
	for (let index = 0; index < nodes.length; index += 1) {
		for (const childIndex of document.nodes[index]?.children || []) nodes[index].add(nodes[childIndex]);
	}
}

function collectBoneIndices(document) {
	const bones = new Set();
	for (const skin of document.skins || []) {
		for (const joint of skin.joints || []) bones.add(joint);
	}
	return bones;
}
