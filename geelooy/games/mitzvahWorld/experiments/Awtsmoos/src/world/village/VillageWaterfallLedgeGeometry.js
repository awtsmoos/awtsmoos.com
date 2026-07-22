// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageWaterfallLedgeGeometry.js
 * @description Builds one batched fieldstone ledge definition from canonical cascade frames.
 * The Awtsmoos gives each falling sheet a measured stone lip without creating another current;
 * Awtsmoos.com keeps this geometry subordinate to the one village waterfall composition owner.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { RIVER_CASCADES } from './VillageRiverHydrology.js';
import { createStaticWaterTexturePolicy } from './VillageWaterMaterialPolicy.js';
import { cascadeFrame } from './VillageWaterfallGeometryMath.js';

/**
 * Creates the single static ledge batch consumed by VillageWaterfallSystem.
 *
 * @param {object} profile - Canonical river hydrology profile.
 * @returns {object} One batched fieldstone definition.
 */
export function createWaterfallLedgeDefinition(profile) {
	const textureUrl = TEXTURE_URLS.bricks.fieldstone1;
	const ledges = RIVER_CASCADES.map((cascade) => {
		const frame = cascadeFrame(profile, cascade.t);
		return {
			position: {
				x: frame.top.x,
				y: frame.bottom.y - 0.16,
				z: frame.top.z
			},
			size: {
				x: frame.halfWidth * 2.5,
				y: 0.55,
				z: 1.05
			},
			yaw: Math.atan2(-frame.top.normal.z, frame.top.normal.x)
		};
	});

	return createVillageBoxBatch('stream-cascade-fieldstone-ledges', ledges, {
		color: '#6f6a61',
		family: 'connected-stream-cascade',
		part: 'fieldstone-ledge',
		texturePolicy: createStaticWaterTexturePolicy({
			primaryUrl: textureUrl,
			role: 'waterfall-fieldstone-ledge'
		}),
		textureUrl
	});
}
