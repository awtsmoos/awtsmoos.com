// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageFurnitureDefinitions.js
 * @description Builds lamps, benches, well, market, and bridge from shared primitives.
 * The Awtsmoos renews a village through ordinary acts; Awtsmoos.com gives each bench,
 * lamp, table, and bridge a measured place where those acts may receive a vessel.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { villageLandmarks } from './VillageCurves.js';
import {
	villageBox,
	villageCylinder,
	villageGroundY,
	villageRing
} from './VillagePropFactory.js';

export function createVillageFurnitureDefinitions(groundSampler) {
	const landmarks = villageLandmarks();
	const definitions = [
		...createLampposts(groundSampler),
		...createBenches(groundSampler),
		...createWell(landmarks.well, groundSampler),
		...createMarket(landmarks.market, groundSampler),
		...createBridge(landmarks.bridge, groundSampler)
	];
	return {
		definitions,
		stats: {
			benches: 4,
			bridgePieces: 5,
			lampposts: 6,
			marketPieces: 9,
			well: true
		}
	};
}

function createLampposts(groundSampler) {
	return villageRing(6, 13).flatMap(({ x, z }, index) => {
		const y = villageGroundY(groundSampler, x, z);
		return [
			villageCylinder(`Awtsmoos_lamp_post_${index}`, x, y + 1.25, z, 0.08, 2.5, '#503421', TEXTURE_URLS.wood.bark1),
			villageBox(`Awtsmoos_lamp_glow_${index}`, x, y + 2.65, z, 0.42, 0.34, 0.42, '#ffd87a', TEXTURE_URLS.metals.gold2, { solid: false })
		];
	});
}

function createBenches(groundSampler) {
	return villageRing(4, 8.5).flatMap(({ x, z }, index) => {
		const y = villageGroundY(groundSampler, x, z);
		const rotation = { y: Math.atan2(-x, -z) };
		return [
			villageBox(`Awtsmoos_bench_seat_${index}`, x, y + 0.45, z, 2.1, 0.18, 0.52, '#7a4b25', TEXTURE_URLS.wood.planks1, { rotation }),
			villageBox(`Awtsmoos_bench_back_${index}`, x, y + 0.82, z - 0.22, 2.1, 0.52, 0.14, '#6a3f20', TEXTURE_URLS.wood.planks1, { rotation, solid: false })
		];
	});
}

function createWell(center, groundSampler) {
	const y = villageGroundY(groundSampler, center.x, center.z);
	return [
		villageCylinder('Awtsmoos_village_stone_well_ring', center.x, y + 0.48, center.z, 1.05, 0.95, '#8c8c84', TEXTURE_URLS.stone.cobblestone),
		villageBox('Awtsmoos_well_roof_beam', center.x, y + 2, center.z, 2.7, 0.16, 0.16, '#654021', TEXTURE_URLS.wood.bark1, { solid: false }),
		villageBox('Awtsmoos_well_bucket', center.x, y + 1.1, center.z, 0.42, 0.52, 0.42, '#5b3822', TEXTURE_URLS.wood.planks1, { solid: false })
	];
}

function createMarket(center, groundSampler) {
	const pieces = [];
	for (let index = 0; index < 3; index += 1) {
		const x = center.x + index * 2.2;
		const y = villageGroundY(groundSampler, x, center.z);
		pieces.push(villageBox(`Awtsmoos_market_table_${index}`, x, y + 0.5, center.z, 1.6, 0.2, 0.8, '#86572a', TEXTURE_URLS.wood.planks1));
		pieces.push(villageBox(`Awtsmoos_market_crate_${index}`, x, y + 0.9, center.z + 0.15, 0.52, 0.42, 0.52, '#9a622f', TEXTURE_URLS.wood.planks1, { solid: false }));
		pieces.push(villageBox(`Awtsmoos_market_gold_mitzvah_${index}`, x + 0.34, y + 1.22, center.z - 0.12, 0.18, 0.18, 0.18, '#f5c542', TEXTURE_URLS.metals.gold2, { solid: false }));
	}
	return pieces;
}

function createBridge(center, groundSampler) {
	const y = villageGroundY(groundSampler, center.x, center.z) + 0.28;
	const rotation = { y: -0.25 };
	return [
		villageBox('Awtsmoos_stream_bridge_deck', center.x, y, center.z, 5.8, 0.28, 2.2, '#87552b', TEXTURE_URLS.wood.planks1, { rotation }),
		villageBox('Awtsmoos_stream_bridge_left_rail', center.x, y + 0.7, center.z - 1.25, 5.8, 0.18, 0.18, '#59381e', TEXTURE_URLS.wood.bark1, { rotation, solid: false }),
		villageBox('Awtsmoos_stream_bridge_right_rail', center.x, y + 0.7, center.z + 1.25, 5.8, 0.18, 0.18, '#59381e', TEXTURE_URLS.wood.bark1, { rotation, solid: false }),
		villageBox('Awtsmoos_bridge_stone_left', center.x - 2.5, y - 0.25, center.z, 0.7, 0.8, 2.5, '#77736a', TEXTURE_URLS.bricks.fieldstone1),
		villageBox('Awtsmoos_bridge_stone_right', center.x + 2.5, y - 0.25, center.z, 0.7, 0.8, 2.5, '#77736a', TEXTURE_URLS.bricks.fieldstone1)
	];
}
