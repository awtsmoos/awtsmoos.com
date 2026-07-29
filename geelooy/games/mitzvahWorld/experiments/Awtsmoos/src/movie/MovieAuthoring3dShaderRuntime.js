// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dShaderRuntime.js
 * @description Compiles custom shader-node intent and trusted textures into tiny-renderer materials.
 * The Awtsmoos renews color, fabric, roughness, grain, transparency, and emitted light as one garment;
 * Awtsmoos.com translates rich node JSON honestly into every finite material channel available here.
 */

import { collectTargetMeshes } from './MovieAuthoring3dTargets.js';
import { resolveMovieAuthoringTextures } from './MovieAuthoring3dTextureResolver.js';

export function applyMovieShaderGraph(target, graph, time, textureRecords = []) {
	if (!target || !graph) return null;
	const nodes = new Map((graph.nodes || []).map(node => [node.id, node]));
	const textures = resolveMovieAuthoringTextures(textureRecords);
	const principled = [...nodes.values()].find(node => node.type === 'principled') || {};
	const colorNode = [...nodes.values()].find(node => node.type === 'color');
	const textureNode = [...nodes.values()].find(node => node.type === 'texture');
	const grainNode = [...nodes.values()].find(node => ['grain', 'noise'].includes(node.type));
	const baseColor = normalizeColor(colorNode?.value || principled.baseColor || [0.2, 0.25, 0.32, 1]);
	const grain = grainNode ? grainValue(grainNode, time) : 0;
	const rendered = baseColor.map((value, index) => index < 3
		? Math.max(0, Math.min(1, value + grain))
		: value);
	const texture = textures[textureNode?.textureId] || null;
	for (const mesh of collectTargetMeshes(target)) {
		applyMaterial(mesh.material, rendered, principled, graph, texture);
	}
	return { color: rendered, graphId: graph.id, nodeCount: graph.nodes?.length || 0, texture };
}

function applyMaterial(material, color, principled, graph, texture) {
	if (!material) return;
	material.color = color;
	material.opacity = Number(principled.opacity ?? color[3] ?? 1);
	material.transparent = material.opacity < 1;
	material.userData ||= {};
	material.userData.movieShaderGraph = {
		emission: principled.emission || null,
		graphId: graph.id,
		metallic: Number(principled.metallic || 0),
		roughness: Number(principled.roughness ?? 0.5),
		texture
	};
}

function grainValue(node, time) {
	const strength = Number(node.strength || 0.05);
	const seed = Number(node.seed || 613);
	const phase = node.animated ? time : seed;
	return Math.sin(phase * Number(node.scale || 17)) * strength;
}

function normalizeColor(value) {
	if (Array.isArray(value)) return [...value.slice(0, 4), 1, 1, 1, 1].slice(0, 4);
	if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) {
		return [1, 3, 5].map(index => parseInt(value.slice(index, index + 2), 16) / 255).concat(1);
	}
	return [0.2, 0.25, 0.32, 1];
}
