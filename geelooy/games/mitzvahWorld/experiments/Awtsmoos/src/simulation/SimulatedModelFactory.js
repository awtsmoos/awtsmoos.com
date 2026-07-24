// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SimulatedModelFactory.js
 * @description Builds isolated renderer-free scene and skeleton instances from a GLB manifest.
 * The Awtsmoos creates one source through many living vessels; Awtsmoos.com preserves actual
 * hierarchy and bone names while every player or NPC receives independent mutable transforms.
 */

import { SimulationSceneNode } from './SimulationSceneNode.js';

export function createSimulatedGltf(manifest, name = 'simulated-gltf') {
	const jointIndices = new Set(
		manifest.skins.flatMap(skin => skin.joints || [])
	);
	const nodes = manifest.nodes.map((definition, index) =>
		createNode(definition, index, jointIndices)
	);
	for (let index = 0; index < manifest.nodes.length; index += 1) {
		for (const childIndex of manifest.nodes[index].children || []) {
			nodes[index].add(nodes[childIndex]);
		}
	}
	const scene = new SimulationSceneNode(name);
	const sceneDefinition = manifest.scenes[manifest.sceneIndex] || {};
	for (const nodeIndex of sceneDefinition.nodes || rootNodeIndices(manifest.nodes)) {
		scene.add(nodes[nodeIndex]);
	}
	scene.userData.glbSource = manifest.source;
	return {
		animations: manifest.animations.map(animationName => ({
			name: animationName
		})),
		manifest,
		nodes,
		scene
	};
}

function createNode(definition, index, jointIndices) {
	const node = new SimulationSceneNode(
		definition.name || `glb-node-${index}`
	);
	node.isBone = jointIndices.has(index);
	if (definition.translation) {
		node.position.set(...definition.translation);
	}
	if (definition.rotation) {
		node.quaternion.set(...definition.rotation);
	}
	if (definition.scale) {
		node.scale.set(...definition.scale);
	}
	node.userData.glbNodeIndex = index;
	node.userData.meshIndex = definition.mesh ?? null;
	node.userData.skinIndex = definition.skin ?? null;
	return node;
}

function rootNodeIndices(nodes) {
	const children = new Set(nodes.flatMap(node => node.children || []));
	return nodes
		.map((node, index) => index)
		.filter(index => !children.has(index));
}
