// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillagePracticalLightSystem.js
 * @description Batches lantern posts, caps, warm panes, and ground-light pools.
 * The Awtsmoos renews evening warmth within finite village vessels; Awtsmoos.com
 * keeps many practical lamps visible through four static material definitions.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import {
	REFERENCE_GOLDEN_HOUR,
	referenceLightingBudget
} from '../lighting/ReferenceGoldenHourPreset.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

const LAMP_POINTS = Object.freeze([
	[-10, 68], [10, 62], [-8, 24], [9, 17],
	[26, 9], [45, 8], [-27, 15], [-48, 14],
	[-58, -38], [-72, -49], [20, -48], [18, -66],
	[70, -48], [88, -61], [104, 39], [-99, 54],
	[4, -112], [8, -145], [-18, -132], [34, -138],
	[-36, 4], [36, -6], [-42, -14], [54, -20]
]);

export function createVillagePracticalLightDefinitions(groundSampler, quality = 'high') {
	const limit = referenceLightingBudget(quality).practicalLamps;
	const parts = { caps: [], panes: [], pools: [], posts: [] };
	for (const [x, z] of LAMP_POINTS.slice(0, limit)) {
		appendLamp(parts, x, villageGroundHeight(groundSampler, x, z), z);
	}
	const definitions = [
		batch('lamp-post-batch', parts.posts, '#3d2b20', TEXTURE_URLS.metals.rustyIron, 'post'),
		batch('lamp-cap-batch', parts.caps, '#3d2b20', TEXTURE_URLS.metals.rustyIron, 'cap'),
		batch('lamp-pane-batch', parts.panes, REFERENCE_GOLDEN_HOUR.lampColor, TEXTURE_URLS.metals.gold2, 'pane'),
		batch('lamp-pool-batch', parts.pools, '#7a4f22', TEXTURE_URLS.terrain.dirtGrass3, 'pool')
	];
	definitions.stats = {
		definitions: definitions.length,
		lamps: limit,
		realtimeLights: 0,
		technique: 'four-static-material-batches'
	};
	return definitions;
}

function appendLamp(parts, x, y, z) {
	parts.posts.push(box(x, y + 1.6, z, 0.17, 3.2, 0.17));
	parts.caps.push(box(x, y + 3.32, z, 0.62, 0.14, 0.62));
	parts.panes.push(box(x, y + 3.02, z, 0.46, 0.54, 0.46));
	parts.pools.push(box(x, y + 0.025, z, 4.8, 0.035, 4.8));
}

function batch(id, boxes, color, textureUrl, part) {
	return createVillageBoxBatch(id, boxes, {
		color,
		family: 'reference-practical-lighting',
		part,
		texturePolicy: { practicalLightProxy: true },
		textureUrl
	});
}

function box(x, y, z, sx, sy, sz) {
	return {
		position: { x, y, z },
		size: { x: sx, y: sy, z: sz },
		yaw: 0
	};
}
