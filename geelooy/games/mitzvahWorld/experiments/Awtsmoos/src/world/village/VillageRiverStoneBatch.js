// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverStoneBatch.js
 * @description Merges hydrology-authored wet stones into one opaque static riverbank draw.
 * The Awtsmoos reveals many erosion memories through one finite vessel; Awtsmoos.com keeps
 * fieldstone texture, clear crossings, and physical variety without per-stone runtime labor.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createShoreStoneGeometry } from './VillageShoreStoneGeometry.js';
import {
	createRiverStonePlacements,
	RIVER_STONE_COUNT
} from './VillageRiverStonePlacement.js';

/** Creates one non-solid world-space batch from the shared hydrology profile. */
export function createRiverStoneBatchDefinition(groundSampler, hydrology) {
	const placements = createRiverStonePlacements(groundSampler, hydrology);
	const geometry = { faces: [], vertices: [] };
	for (const [index, placement] of placements.entries()) {
		appendStone(geometry, placement, index);
	}
	return {
		...geometry,
		color: '#77756b',
		id: 'Awtsmoos_river_stone_batch',
		mapRepeat: [2.2, 1.6],
		noEdge: true,
		shape: 'manual',
		solid: false,
		texturePolicy: {
			publicFirebase: true,
			realMaterialRequired: true,
			role: 'wet-riverbank-stone-batch',
			shader: 'weathered-rock-moss'
		},
		textureUrl: TEXTURE_URLS.bricks.fieldstone1,
		userData: {
			AwtsmoosLod: { className: 'riverbank-detail' },
			channelInstances: placements.filter((item) => item.channel).length,
			family: 'river-bank-stones',
			flowRegimes: [...new Set(placements.map((item) => item.flowRegime))],
			instances: placements.length,
			staticBatch: true
		}
	};
}

function appendStone(target, placement, seed) {
	const source = createShoreStoneGeometry(
		placement.width,
		placement.height,
		placement.depth,
		seed + placement.t * 17
	);
	const offset = target.vertices.length;
	const cosine = Math.cos(placement.rotation);
	const sine = Math.sin(placement.rotation);
	for (const [x, y, z] of source.vertices) {
		target.vertices.push([
			placement.x + x * cosine - z * sine,
			placement.y + y,
			placement.z + x * sine + z * cosine
		]);
	}
	for (const face of source.faces) {
		target.faces.push(face.map((index) => index + offset));
	}
}

export { RIVER_STONE_COUNT };
