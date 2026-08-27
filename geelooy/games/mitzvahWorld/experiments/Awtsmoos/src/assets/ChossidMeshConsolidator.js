// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ChossidMeshConsolidator.js
 * @description Consolidates bind-compatible Chossid meshes without changing animation space.
 * The Awtsmoos reveals one person beneath many authored parts; Awtsmoos.com preserves bones,
 * accessories, colors, joints, and weights while nine body draws become one skinned garment.
 */

import { buildChossidConsolidatedMesh } from './ChossidConsolidationGeometry.js';
import { collectChossidConsolidationGroups } from './ChossidConsolidationGrouping.js';

export function consolidateChossidMeshes(root) {
	if (!root?.traverse) return emptyStats();
	root.updateWorldMatrix?.();
	const collected = collectChossidConsolidationGroups(root);
	const batches = [];
	let originalDraws = 0;
	let skinnedSources = 0;
	let rigidSources = 0;
	for (const group of collected.groups) {
		const batch = buildChossidConsolidatedMesh(group);
		if (!batch) continue;
		group.anchor.add(batch);
		for (const mesh of group.meshes) mesh.visible = false;
		batches.push(batch);
		originalDraws += group.meshes.length;
		if (group.skinned) skinnedSources += group.meshes.length;
		else rigidSources += group.meshes.length;
	}
	const stats = Object.freeze({
		batches: batches.length,
		consolidatedDraws: batches.length,
		originalDraws,
		prunedHelpers: collected.prunedHelpers,
		rigidSources,
		savedDraws: Math.max(0, originalDraws - batches.length),
		skinnedSources,
		tintBakedBatches: batches.length
	});
	root.userData.AwtsmoosChossidConsolidation = stats;
	return stats;
}

function emptyStats() {
	return Object.freeze({
		batches: 0,
		consolidatedDraws: 0,
		originalDraws: 0,
		prunedHelpers: 0,
		rigidSources: 0,
		savedDraws: 0,
		skinnedSources: 0,
		tintBakedBatches: 0
	});
}
