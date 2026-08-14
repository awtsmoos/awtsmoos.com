// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageRiverStoneBatch.js
 * @description Expands audited stone deposits into one opaque static riverbank and channel draw.
 * The Awtsmoos reveals many erosion memories through one finite vessel; Awtsmoos.com keeps grouped stones, partial submersion,
 * and geological variety in one batch so richer game and Studio banks do not become per-stone runtime labor.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createShoreStoneGeometry } from './VillageShoreStoneGeometry.js';
import {
	createRiverStonePlacements,
	RIVER_STONE_CLUSTER_COUNT,
	RIVER_STONE_COUNT
} from './VillageRiverStonePlacement.js';

export function createRiverStoneBatchDefinition(groundSampler, hydrology) {
	const clusters = createRiverStonePlacements(groundSampler, hydrology);
	const geometry = { faces: [], vertices: [] };
	let channelInstances = 0;
	let instances = 0;
	clusters.forEach((cluster, clusterIndex) => {
		for (let stoneIndex = 0; stoneIndex < cluster.stoneCount; stoneIndex += 1) {
			appendStone(geometry, stoneFromCluster(cluster, clusterIndex, stoneIndex), instances);
			if (cluster.channel) channelInstances += 1;
			instances += 1;
		}
	});
	return {
		...geometry,
		color: '#716f65',
		id: 'Awtsmoos_river_stone_batch',
		mapRepeat: [2.2, 1.6],
		noEdge: true,
		shape: 'manual',
		solid: false,
		texturePolicy: {
			publicFirebase: true,
			realMaterialRequired: true,
			role: 'wet-riverbank-stone-deposits',
			shader: 'weathered-rock-moss'
		},
		textureUrl: TEXTURE_URLS.bricks.fieldstone1,
		userData: {
			AwtsmoosLod: { className: 'riverbank-detail' },
			channelInstances,
			clusters: clusters.length,
			densityAuthority: 'shared-spatial-stone-deposits',
			family: 'river-bank-stones',
			flowRegimes: [...new Set(clusters.map(item => item.flowRegime))],
			instances,
			staticBatch: true
		}
	};
}

function stoneFromCluster(cluster, clusterIndex, stoneIndex) {
	const phase = clusterIndex * 1.47 + stoneIndex * 2.23;
	const radial = stoneIndex === 0
		? 0
		: cluster.clusterRadius * (0.48 + stoneIndex * 0.12);
	const scale = 0.82 + (Math.sin(phase * 1.31) + 1) * 0.14;
	return {
		...cluster,
		depth: cluster.depth * (0.86 + (Math.cos(phase) + 1) * 0.12),
		height: cluster.height * (0.8 + (Math.sin(phase * 0.73) + 1) * 0.13),
		rotation: cluster.rotation + Math.sin(phase) * 0.44,
		width: cluster.width * scale,
		x: cluster.x + Math.cos(phase) * radial,
		y: cluster.y + (cluster.channel ? -0.05 : 0.018) * stoneIndex,
		z: cluster.z + Math.sin(phase) * radial
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
		target.faces.push(face.map(index => index + offset));
	}
}

export { RIVER_STONE_CLUSTER_COUNT, RIVER_STONE_COUNT };
