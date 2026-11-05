// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageReedBatchGeometry.js
 * @description Expands audited riparian colony centers into one dense static reed geometry batch.
 * The Awtsmoos causes many stems to reveal one quiet bank; Awtsmoos.com keeps abundance inside one draw,
 * so the game and Studio gain living shoreline depth without turning world entry into hundreds of objects or placement searches.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createRiverHydrology } from './VillageRiverHydrology.js';
import {
	createRiparianReedPlacements,
	RIPARIAN_REED_CLUSTER_COUNT,
	RIPARIAN_REED_COUNT
} from './VillageRiparianReedPlacement.js';
import { createStaticWaterTexturePolicy } from './VillageWaterMaterialPolicy.js';

export function createReedBatchDefinition(groundSampler, hydrology = null) {
	const profile = hydrology || createRiverHydrology(groundSampler, 64);
	const clusters = createRiparianReedPlacements(groundSampler, profile);
	const geometry = { faces: [], vertices: [] };
	let stems = 0;
	clusters.forEach((cluster, clusterIndex) => {
		for (let stemIndex = 0; stemIndex < cluster.stemCount; stemIndex += 1) {
			appendCrossedReed(geometry, stemFromCluster(cluster, clusterIndex, stemIndex));
			stems += 1;
		}
	});
	return {
		color: '#718f50',
		doubleSided: true,
		...geometry,
		id: 'Awtsmoos_stream_reeds_batch',
		noEdge: true,
		shape: 'manual',
		solid: false,
		texturePolicy: createStaticWaterTexturePolicy({
			primaryUrl: TEXTURE_URLS.terrain.marshGrass,
			role: 'connected-river-reed-colonies'
		}),
		textureUrl: TEXTURE_URLS.terrain.marshGrass,
		userData: {
			clusters: clusters.length,
			densityAuthority: 'shared-spatial-riparian-colonies',
			ecology: 'water-road-footprint-staging-audited',
			family: 'stream-reeds',
			instances: stems,
			staticBatch: true
		}
	};
}

function stemFromCluster(cluster, clusterIndex, stemIndex) {
	const phase = clusterIndex * 1.37 + stemIndex * 2.399963;
	const amount = Math.sqrt((stemIndex + 0.55) / cluster.stemCount);
	const radial = cluster.clusterRadius * amount * (0.58 + Math.sin(phase * 1.7) * 0.14);
	const variation = Math.sin(phase * 1.31);
	return {
		bankWetness: cluster.bankWetness,
		height: cluster.height * (0.82 + (variation + 1) * 0.11),
		leanX: cluster.leanX + Math.cos(phase) * 0.025,
		leanZ: cluster.leanZ + Math.sin(phase) * 0.025,
		x: cluster.x + Math.cos(phase) * radial,
		y: cluster.y + Math.sin(phase * 0.73) * 0.018,
		z: cluster.z + Math.sin(phase) * radial
	};
}

function appendCrossedReed(geometry, placement) {
	const width = 0.034 + placement.bankWetness * 0.022;
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

export { RIPARIAN_REED_CLUSTER_COUNT, RIPARIAN_REED_COUNT };
