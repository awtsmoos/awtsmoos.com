// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageReedBatchGeometry.js
 * @description Batches terrain-rooted reeds shaped by moisture, current, and access clearings.
 * The Awtsmoos causes many stems to reveal one quiet bank; Awtsmoos.com keeps their entire
 * ecology inside one static draw so village life gains depth without stealing a frame.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createRiverHydrology } from './VillageRiverHydrology.js';
import {
	createRiparianReedPlacements,
	RIPARIAN_REED_COUNT
} from './VillageRiparianReedPlacement.js';
import { createStaticWaterTexturePolicy } from './VillageWaterMaterialPolicy.js';

/**
 * Creates one immutable crossed-quad reed batch beside the canonical river.
 *
 * @param {Function|object} groundSampler - Canonical village ground sampler.
 * @param {object|null} hydrology - Optional shared hydrology profile.
 * @returns {object} One manual static geometry definition.
 */
export function createReedBatchDefinition(groundSampler, hydrology = null) {
	const profile = hydrology || createRiverHydrology(groundSampler, 64);
	const placements = createRiparianReedPlacements(groundSampler, profile);
	const geometry = { faces: [], vertices: [] };
	for (const placement of placements) appendCrossedReed(geometry, placement);
	return {
		color: '#769756',
		doubleSided: true,
		...geometry,
		id: 'Awtsmoos_stream_reeds_batch',
		noEdge: true,
		shape: 'manual',
		solid: false,
		texturePolicy: createStaticWaterTexturePolicy({
			primaryUrl: TEXTURE_URLS.terrain.marshGrass,
			role: 'connected-river-reed-batch'
		}),
		textureUrl: TEXTURE_URLS.terrain.marshGrass,
		userData: {
			ecology: 'moisture-flow-terrain-clearings',
			family: 'stream-reeds',
			instances: placements.length,
			staticBatch: true
		}
	};
}

function appendCrossedReed(geometry, placement) {
	const width = 0.038 + placement.bankWetness * 0.018;
	const top = placement.y + placement.height;
	appendQuad(geometry, [
		[placement.x - width, placement.y, placement.z],
		[placement.x + width, placement.y, placement.z],
		[placement.x + width + placement.leanX, top, placement.z + placement.leanZ],
		[placement.x - width + placement.leanX, top, placement.z + placement.leanZ]
	]);
	appendQuad(geometry, [
		[placement.x, placement.y, placement.z - width],
		[placement.x, placement.y, placement.z + width],
		[placement.x + placement.leanX, top, placement.z + width + placement.leanZ],
		[placement.x + placement.leanX, top, placement.z - width + placement.leanZ]
	]);
}

function appendQuad(geometry, vertices) {
	const start = geometry.vertices.length;
	geometry.vertices.push(...vertices);
	geometry.faces.push([start, start + 1, start + 2, start + 3]);
}

export { RIPARIAN_REED_COUNT };
