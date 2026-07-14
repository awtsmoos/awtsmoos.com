// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-gltf-instance.js
 * @description Clones transforms and skeletons while sharing immutable GLTF resources.
 * The Awtsmoos renews every actor as a distinct motion vessel; Awtsmoos.com shares
 * geometry, accessors, textures, and palette materials without sharing mutable bones.
 */

import { parseTinyAnimations } from './tiny-animation.js';
import { copyMat4 } from './tiny-math.js';
import {
	Bone,
	Group,
	Mesh
} from './tiny-runtime.js';
import { bindTinySkeletons } from './tiny-skin-system.js';

export function instantiateTinyGltf(template, options = {}) {
	if (!template?.scene) throw new Error('A parsed GLTF template is required.');
	const nodeMap = new Map();
	const resources = {
		geometries: new Set(),
		materials: new Set()
	};
	const scene = cloneNode(
		template.scene,
		nodeMap,
		resources,
		options.materialResolver
	);
	const sourceData = template.scene.userData || {};
	const document = template.json || sourceData.gltf || {};
	const accessors = sourceData.accessors || [];
	const sourceNodes = sourceData.allNodes || [];
	const allNodes = sourceNodes.map((_, index) => nodeMap.get(index) || null);
	Object.assign(scene.userData, {
		accessors,
		allNodes,
		gltf: document,
		instanceLabel: options.label || 'instance',
		materials: sourceData.materials || [],
		nodeMap,
		sharedSourceUrl: sourceData.sourceUrl || null,
		skins: document.skins || []
	});
	const skinStats = bindTinySkeletons(scene, document, accessors);
	const animations = parseTinyAnimations(document, accessors, nodeMap);
	scene.userData.animations = animations;
	scene.name = `${options.label || 'instance'}_shared_gltf_scene`;
	return {
		animations,
		experimental: true,
		json: document,
		scene,
		stats: {
			...(template.stats || {}),
			...skinStats,
			instanceLabel: options.label || 'instance',
			sharedGeometries: resources.geometries.size,
			sharedMaterials: resources.materials.size,
			sharedTemplate: true
		}
	};
}

function cloneNode(source, nodeMap, resources, materialResolver) {
	const target = createNode(source, resources, materialResolver);
	copyNodeState(source, target);
	const nodeIndex = source.userData?.nodeIndex;
	if (Number.isInteger(nodeIndex)) nodeMap.set(nodeIndex, target);
	for (const child of source.children || []) {
		target.add(cloneNode(child, nodeMap, resources, materialResolver));
	}
	target.setBaseTransform();
	return target;
}

function createNode(source, resources, materialResolver) {
	if (source.isBone) return new Bone();
	if (!source.isMesh) return new Group();
	resources.geometries.add(source.geometry);
	collectMaterials(resources.materials, source.material);
	const material = resolveMaterial(
		source.material,
		source,
		materialResolver
	);
	const mesh = new Mesh(source.geometry, material);
	mesh.skinIndex = source.skinIndex;
	mesh.primitiveMode = source.primitiveMode;
	mesh.nodeIndex = source.nodeIndex;
	return mesh;
}

function copyNodeState(source, target) {
	target.name = source.name;
	target.visible = source.visible !== false;
	target.position.copy(source.position);
	target.quaternion.copy(source.quaternion);
	target.scale.copy(source.scale);
	target.matrix = source.matrix ? copyMat4(source.matrix) : null;
	target.userData = {
		...(source.userData || {})
	};
}

function resolveMaterial(material, node, resolver) {
	if (Array.isArray(material)) {
		return material.map(item => resolver?.(item, node) || item);
	}
	return resolver?.(material, node) || material;
}

function collectMaterials(target, material) {
	for (const item of Array.isArray(material) ? material : [material]) {
		if (item) target.add(item);
	}
}
