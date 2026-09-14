//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file ChossidConsolidationGeometry.js
 * @description Assembles one consolidated Chossid renderer vessel from portable bind-space streams produced by a dedicated transform module.
 * RESPONSIBILITY: invoke stream packing, request Core-native mesh/material creation, attach skeleton identity, and publish consolidation evidence.
 * NON-RESPONSIBILITY: this module does not perform vertex transforms or construct renderer geometry/material classes directly.
 */

import {
	createNativeGeometryMesh,
	createNativeStaticBatchMaterial
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { createChossidConsolidationStreams } from './ChossidConsolidationStreams.js';

/**
 * Build one consolidated draw vessel from a bind-compatible source group.
 * @param {object} group Anchor, source meshes, optional skeleton, and skinned identity.
 * @returns {object|null} Core-owned mesh or null when no renderable triangle data exists.
 */
export function buildChossidConsolidatedMesh(group) {
	if (!group.meshes.length) return null;
	const streams = createChossidConsolidationStreams(group);
	if (streams.positions.length < 9) return null;
	const evidence = consolidationEvidence(group, streams);
	const batch = createNativeGeometryMesh(
		streams,
		createNativeStaticBatchMaterial(group.meshes[0].material),
		{
			family: 'chossid-consolidated-batch',
			name: `AwtsmoosChossidBatch:${group.skinned ? 'skin' : 'rigid'}:${group.meshes.length}`,
			userData: { AwtsmoosChossidConsolidation: evidence }
		}
	);
	batch.isSkinnedMesh = group.skinned;
	batch.skeleton = group.skeleton;
	batch.setBaseTransform();
	return batch;
}

/** Build compact immutable evidence consumed by tests, profiling, and draw-call diagnostics. */
function consolidationEvidence(group, streams) {
	return {
		anchor: group.anchor?.name || 'root',
		members: group.meshes.length,
		skinned: group.skinned,
		tintBakedIntoVertexColor: true,
		triangles: streams.indices.length / 3,
		vertices: streams.positions.length / 3
	};
}
