// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dShaderRuntime.js
 * @description Compiles shader-node intent and safely binds trusted textures into mutable runtime materials.
 * The Awtsmoos renews color, roughness, grain, transparency, and emitted light as one garment;
 * Awtsmoos.com preserves frozen renderer vessels while geometry carries truthful shader evidence.
 */

import { collectTargetMeshes } from './MovieAuthoring3dTargets.js';
import { resolveMovieAuthoringTextures } from './MovieAuthoring3dTextureResolver.js';

export function applyMovieShaderGraph(target, graph, time, textureRecords = [], textureRuntime = null) {
	if (!target || !graph) return null;
	const nodes = new Map((graph.nodes || []).map(node => [node.id, node]));
	const textures = resolveMovieAuthoringTextures(textureRecords);
	const principled = [...nodes.values()].find(node => node.type === 'principled') || {};
	const colorNode = [...nodes.values()].find(node => node.type === 'color');
	const textureNode = [...nodes.values()].find(node => node.type === 'texture');
	const grainNode = [...nodes.values()].find(node => ['grain', 'noise'].includes(node.type));
	const baseColor = normalizeColor(colorNode?.value || principled.baseColor || [0.2, 0.25, 0.32, 1]);
	const grain = grainNode ? grainValue(grainNode, time) : 0;
	const rendered = baseColor.map((value, index) => {
		return index < 3 ? Math.max(0, Math.min(1, value + grain)) : value;
	});
	const texture = textures[textureNode?.textureId] || null;
	const asset = textureRuntime?.asset?.(textureNode?.textureId) || null;
	for (const mesh of collectTargetMeshes(target)) {
		applyMaterial(mesh, rendered, principled, graph, texture, asset, textureNode);
	}
	return {
		color: rendered,
		graphId: graph.id,
		nodeCount: graph.nodes?.length || 0,
		texture: textureEvidence(texture, asset)
	};
}

function applyMaterial(mesh, color, principled, graph, texture, asset, node = {}) {
	const evidence = shaderEvidence(principled, graph, texture, asset);
	storeShaderEvidence(mesh, evidence);
	const material = mesh.material;
	if (!material || !Object.isExtensible(material)) return;
	material.color = color;
	material.opacity = Number(principled.opacity ?? color[3] ?? 1);
	material.transparent = material.opacity < 1;
	if (texture?.url) {
		material.textureUrl = texture.url;
		material.mapRepeat = pair(node.repeat || texture.repeat, [1, 1]);
		material.mapOffset = pair(node.offset || texture.offset, [0, 0]);
	}
	if (asset?.status === 'ready' && asset.image) {
		material.mapImage = asset.image;
		material.mapImageFallback = false;
	}
	if (!material.userData) material.userData = {};
	if (Object.isExtensible(material.userData)) {
		material.userData.movieShaderGraph = evidence;
	}
}

function shaderEvidence(principled, graph, texture, asset) {
	return {
		emission: principled.emission || null,
		graphId: graph.id,
		metallic: Number(principled.metallic || 0),
		roughness: Number(principled.roughness ?? 0.5),
		texture: textureEvidence(texture, asset)
	};
}

function storeShaderEvidence(mesh, evidence) {
	const geometry = mesh.geometry;
	if (!geometry || !Object.isExtensible(geometry)) return;
	geometry.userData ||= {};
	if (Object.isExtensible(geometry.userData)) {
		geometry.userData.movieShaderGraph = evidence;
	}
}

function textureEvidence(texture, asset) {
	if (!texture) return null;
	return {
		error: asset?.error || null,
		height: asset?.height || 0,
		kind: texture.kind,
		status: asset?.status || (texture.kind === 'procedural' ? 'procedural' : 'unmanaged'),
		url: texture.url || null,
		width: asset?.width || 0
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

function pair(value, fallback) {
	return Array.isArray(value) ? [Number(value[0]), Number(value[1])] : [...fallback];
}
