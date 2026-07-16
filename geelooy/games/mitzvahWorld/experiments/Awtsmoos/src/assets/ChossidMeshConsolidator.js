// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChossidMeshConsolidator.js
 * @description Consolidates visible chossid.glb primitives beneath the same animated bone.
 * The Awtsmoos keeps the exact authored human, materials, bones, and animation while
 * Awtsmoos.com removes redundant draw submissions from rigid accessories and equal skin parts.
 */

import {
	BufferAttribute,
	BufferGeometry,
	Mesh
} from '../../../light-three-gltf/tiny-runtime.js';
import {
	identity,
	inverse,
	multiply
} from '../../../light-three-gltf/tiny-math.js';

const materialIds = new WeakMap();
const anchorIds = new WeakMap();
const skeletonIds = new WeakMap();
let nextIdentity = 1;

export function consolidateChossidMeshes(root) {
	root.updateWorldMatrix();
	const stats = {
		batches: 0,
		prunedHelpers: 0,
		rigidSources: 0,
		savedDraws: 0,
		skinnedSources: 0,
		sourceMeshes: 0
	};
	const groups = new Map();
	root.traverse(mesh => {
		if (!eligibleMesh(mesh) || !visibleHierarchy(mesh)) return;
		if (!mesh.geometry.attributes.normal) {
			mesh.visible = false;
			stats.prunedHelpers += 1;
			return;
		}
		const skinned = Boolean(mesh.isSkinnedMesh && mesh.skeleton);
		const anchor = skinned ? mesh.parent : nearestAnimatedAnchor(mesh, root);
		const key = groupKey(anchor, mesh.material, skinned ? mesh.skeleton : null, skinned);
		if (!groups.has(key)) groups.set(key, { anchor, meshes: [], skinned });
		groups.get(key).meshes.push(mesh);
	});
	for (const group of groups.values()) {
		if (group.meshes.length < 2) continue;
		const batch = mergeGroup(group.anchor, group.meshes, group.skinned);
		if (!batch) continue;
		for (const mesh of group.meshes) mesh.parent?.remove(mesh);
		group.anchor.add(batch);
		stats.batches += 1;
		stats.sourceMeshes += group.meshes.length;
		stats.savedDraws += group.meshes.length - 1;
		stats[group.skinned ? 'skinnedSources' : 'rigidSources'] += group.meshes.length;
	}
	root.updateWorldMatrix();
	root.userData.chossidMeshConsolidation = stats;
	return stats;
}

function eligibleMesh(mesh) {
	return Boolean(
		mesh?.isMesh
		&& (mesh.geometry?.mode ?? mesh.primitiveMode ?? 4) === 4
		&& mesh.geometry?.attributes?.position
		&& mesh.material
		&& mesh.material.transparent !== true
		&& mesh.material.alphaMode !== 'BLEND'
	);
}

function visibleHierarchy(object) {
	for (let current = object; current; current = current.parent) {
		if (current.visible === false) return false;
	}
	return true;
}

function nearestAnimatedAnchor(mesh, root) {
	for (let current = mesh.parent; current && current !== root; current = current.parent) {
		if (current.isBone) return current;
	}
	return root;
}

function groupKey(anchor, material, skeleton, skinned) {
	return [
		skinned ? 'skin' : 'rigid',
		identityFor(anchorIds, anchor),
		identityFor(materialIds, material),
		identityFor(skeletonIds, skeleton)
	].join(':');
}

function identityFor(store, value) {
	if (!value || typeof value !== 'object') return 0;
	if (!store.has(value)) store.set(value, nextIdentity++);
	return store.get(value);
}

function mergeGroup(anchor, meshes, skinned) {
	const streams = {
		color: [],
		joints: [],
		normal: [],
		position: [],
		uv: [],
		weights: []
	};
	const inverseAnchor = inverse(anchor.matrixWorld || identity());
	for (const mesh of meshes) {
		appendMesh(streams, mesh, multiply(inverseAnchor, mesh.matrixWorld || identity()), skinned);
	}
	if (streams.position.length < 9) return null;
	const geometry = new BufferGeometry();
	geometry.mode = 4;
	geometry.setAttribute('position', floatAttribute(streams.position, 3));
	geometry.setAttribute('normal', floatAttribute(streams.normal, 3));
	geometry.setAttribute('color', floatAttribute(streams.color, 4));
	geometry.setAttribute('uv', floatAttribute(streams.uv, 2));
	if (skinned) {
		geometry.setAttribute('joints', floatAttribute(streams.joints, 4));
		geometry.setAttribute('weights', floatAttribute(streams.weights, 4));
	}
	geometry.userData.AwtsmoosChossidConsolidation = {
		sourceMeshes: meshes.length,
		vertices: streams.position.length / 3
	};
	const batch = new Mesh(geometry, meshes[0].material);
	batch.name = `Awtsmoos_chossid_glb_consolidated_${safeName(anchor.name)}_${safeName(meshes[0].material.name)}`;
	batch.userData = {
		AwtsmoosChossidConsolidation: geometry.userData.AwtsmoosChossidConsolidation,
		dynamic: true,
		family: 'animated-chossid-glb-consolidated'
	};
	if (skinned) {
		batch.isSkinnedMesh = true;
		batch.skinIndex = meshes[0].skinIndex;
		batch.skeleton = meshes[0].skeleton;
	}
	batch.setBaseTransform();
	return batch;
}

function appendMesh(streams, mesh, matrix, skinned) {
	const geometry = mesh.geometry;
	const position = geometry.attributes.position;
	const normal = geometry.attributes.normal;
	const color = geometry.attributes.color;
	const uv = geometry.attributes.uv;
	const joints = geometry.attributes.joints;
	const weights = geometry.attributes.weights;
	const indices = geometry.index?.array || null;
	const count = indices ? geometry.index.count : position.count;
	const normalMatrix = inverse(matrix);
	for (let offset = 0; offset < count; offset += 1) {
		const index = indices ? indices[offset] : offset;
		appendPosition(streams.position, position, index, matrix);
		appendNormal(streams.normal, normal, index, normalMatrix);
		appendVector(streams.color, color, index, 4, [1, 1, 1, 1]);
		appendVector(streams.uv, uv, index, 2, [0, 0]);
		if (skinned) {
			appendVector(streams.joints, joints, index, 4, [0, 0, 0, 0]);
			appendVector(streams.weights, weights, index, 4, [1, 0, 0, 0]);
		}
	}
}

function appendPosition(target, attribute, index, matrix) {
	const x = value(attribute, index, 0, 0);
	const y = value(attribute, index, 1, 0);
	const z = value(attribute, index, 2, 0);
	target.push(
		matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
		matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
		matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]
	);
}

function appendNormal(target, attribute, index, inverseMatrix) {
	const x = value(attribute, index, 0, 0);
	const y = value(attribute, index, 1, 1);
	const z = value(attribute, index, 2, 0);
	const nx = inverseMatrix[0] * x + inverseMatrix[1] * y + inverseMatrix[2] * z;
	const ny = inverseMatrix[4] * x + inverseMatrix[5] * y + inverseMatrix[6] * z;
	const nz = inverseMatrix[8] * x + inverseMatrix[9] * y + inverseMatrix[10] * z;
	const length = Math.hypot(nx, ny, nz) || 1;
	target.push(nx / length, ny / length, nz / length);
}

function appendVector(target, attribute, index, size, fallback) {
	for (let component = 0; component < size; component += 1) {
		target.push(value(attribute, index, component, fallback[component]));
	}
}

function value(attribute, index, component, fallback) {
	if (!attribute || component >= attribute.itemSize) return fallback;
	const raw = Number(attribute.array[index * attribute.itemSize + component] ?? fallback);
	if (!attribute.normalized) return raw;
	if (attribute.array instanceof Uint8Array) return raw / 255;
	if (attribute.array instanceof Int8Array) return Math.max(-1, raw / 127);
	if (attribute.array instanceof Uint16Array) return raw / 65535;
	if (attribute.array instanceof Int16Array) return Math.max(-1, raw / 32767);
	return raw;
}

function floatAttribute(values, itemSize) {
	return new BufferAttribute(new Float32Array(values), itemSize, false);
}

function safeName(value) {
	return String(value || 'root').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 36);
}

export default consolidateChossidMeshes;
