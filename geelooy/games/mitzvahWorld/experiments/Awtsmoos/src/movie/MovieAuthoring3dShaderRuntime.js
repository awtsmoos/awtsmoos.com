//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dShaderRuntime.js
 * @description Compiles editable shader-node intent while enforcing remote-only material manifestation across every target mesh.
 * The Awtsmoos renews color, roughness, grain, transparency, and image as one garment in flight;
 * Awtsmoos.com preserves every low-level control, yet the scene stays hidden until verified remote pixels enter sight.
 */

import { enforceSceneRemoteMaterialReadiness } from '../assets/SceneRemoteMaterialReadiness.js';
import {
	bindMovieRemoteMaterial,
	movieTextureEvidence
} from './MovieAuthoring3dRemoteMaterialBinding.js';
import { collectTargetMeshes } from './MovieAuthoring3dTargets.js';
import { resolveMovieAuthoringTextures } from './MovieAuthoring3dTextureResolver.js';

/** Applies one editable shader graph and then re-enforces the global remote-only visibility covenant. */
export function applyMovieShaderGraph(target, graph, time, textureRecords = [], textureRuntime = null) {
	if (!target || !graph) {
		return null;
	}
	const nodes = new Map((graph.nodes || []).map(node => [node.id, node]));
	const textures = resolveMovieAuthoringTextures(textureRecords);
	const principled = [...nodes.values()].find(node => node.type === 'principled') || {};
	const colorNode = [...nodes.values()].find(node => node.type === 'color');
	const textureNode = [...nodes.values()].find(node => node.type === 'texture');
	const grainNode = [...nodes.values()].find(node => ['grain', 'noise'].includes(node.type));
	const baseColor = normalizeColor(colorNode?.value || principled.baseColor || [1, 1, 1, 1]);
	const color = modulatedColor(baseColor, grainNode, time);
	const texture = textures[textureNode?.textureId] || null;
	const asset = textureRuntime?.asset?.(textureNode?.textureId) || null;
	for (const mesh of collectTargetMeshes(target)) {
		bindMovieRemoteMaterial(mesh, {
			asset,
			color,
			graph,
			node: textureNode,
			principled,
			texture
		});
	}
	const readiness = enforceSceneRemoteMaterialReadiness(target);
	return {
		color,
		graphId: graph.id,
		nodeCount: graph.nodes?.length || 0,
		readiness,
		texture: movieTextureEvidence(texture, asset)
	};
}

function modulatedColor(baseColor, grainNode, time) {
	const grain = grainNode ? grainValue(grainNode, time) : 0;
	return baseColor.map((value, index) => {
		return index < 3
			? Math.max(0, Math.min(1, value + grain))
			: value;
	});
}

function grainValue(node, time) {
	const strength = Number(node.strength || 0.05);
	const seed = Number(node.seed || 613);
	const phase = node.animated ? time : seed;
	return Math.sin(phase * Number(node.scale || 17)) * strength;
}

function normalizeColor(value) {
	if (Array.isArray(value)) {
		return [...value.slice(0, 4), 1, 1, 1, 1].slice(0, 4);
	}
	if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) {
		return [1, 3, 5]
			.map(index => parseInt(value.slice(index, index + 2), 16) / 255)
			.concat(1);
	}
	return [1, 1, 1, 1];
}
