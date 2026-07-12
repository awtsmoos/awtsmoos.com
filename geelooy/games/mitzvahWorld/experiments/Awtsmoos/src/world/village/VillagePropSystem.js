// B"H
import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { villageLandmarks } from './VillageCurves.js';

/** Builds lampposts, signs, benches, a well, and market vessels for a real village. */
export function createVillagePropDefinitions(groundSampler) {
	const marks = villageLandmarks();
	const definitions = [
		...lampposts(groundSampler),
		...signs(groundSampler),
		...benches(groundSampler),
		...well(marks.well, groundSampler),
		...market(marks.market, groundSampler),
		...bridge(marks.bridge, groundSampler)
	];
	return {
		definitions,
		stats: {
			propCount: definitions.length,
			lampposts: 6,
			signs: 4,
			benches: 4,
			well: true,
			marketPieces: 9,
			bridgePieces: 5
		}
	};
}

function lampposts(groundSampler) {
	return ring(6, 13).flatMap(({ x, z }, index) => {
		const y = groundY(groundSampler, x, z);
		return [
			cylinder(`Awtsmoos_lamp_post_${index}`, x, y + 1.25, z, 0.08, 2.5, '#503421', TEXTURE_URLS.wood.bark1),
			box(`Awtsmoos_lamp_glow_${index}`, x, y + 2.65, z, 0.42, 0.34, 0.42, '#ffd87a', TEXTURE_URLS.metals.gold2, false)
		];
	});
}

function signs(groundSampler) {
	const data = [
		['forest', -21, 1, 'FOREST'],
		['lake', -15, -8, 'LAKE'],
		['learning', 15, -5, 'LEARN'],
		['chesed', -8, 13, 'CHESED']
	];
	return data.flatMap(([name, x, z, label], index) => {
		const y = groundY(groundSampler, x, z);
		return [
			cylinder(`Awtsmoos_sign_post_${name}`, x, y + 0.75, z, 0.055, 1.5, '#5d3b1f', TEXTURE_URLS.wood.bark1),
			box(`Awtsmoos_sign_board_${name}_${label}`, x, y + 1.55, z, 1.4, 0.46, 0.1, '#d6b06f', TEXTURE_URLS.fabric.parchment, false, { y: index * 0.7 })
		];
	});
}

function benches(groundSampler) {
	return ring(4, 8.5).flatMap(({ x, z }, index) => {
		const y = groundY(groundSampler, x, z);
		const yaw = Math.atan2(-x, -z);
		return [
			box(`Awtsmoos_bench_seat_${index}`, x, y + 0.45, z, 2.1, 0.18, 0.52, '#7a4b25', TEXTURE_URLS.wood.planks1, true, { y: yaw }),
			box(`Awtsmoos_bench_back_${index}`, x, y + 0.82, z - 0.22, 2.1, 0.52, 0.14, '#6a3f20', TEXTURE_URLS.wood.planks1, false, { y: yaw })
		];
	});
}

function well(center, groundSampler) {
	const y = groundY(groundSampler, center.x, center.z);
	return [
		cylinder('Awtsmoos_village_stone_well_ring', center.x, y + 0.48, center.z, 1.05, 0.95, '#8c8c84', TEXTURE_URLS.stone.cobblestone),
		box('Awtsmoos_well_roof_beam', center.x, y + 2.0, center.z, 2.7, 0.16, 0.16, '#654021', TEXTURE_URLS.wood.bark1, false),
		box('Awtsmoos_well_bucket', center.x, y + 1.1, center.z, 0.42, 0.52, 0.42, '#5b3822', TEXTURE_URLS.wood.planks1, false)
	];
}

function market(center, groundSampler) {
	const pieces = [];
	for (let index = 0; index < 3; index += 1) {
		const x = center.x + index * 2.2;
		const z = center.z;
		const y = groundY(groundSampler, x, z);
		pieces.push(box(`Awtsmoos_market_table_${index}`, x, y + 0.5, z, 1.6, 0.2, 0.8, '#86572a', TEXTURE_URLS.wood.planks1, true));
		pieces.push(box(`Awtsmoos_market_crate_${index}`, x, y + 0.9, z + 0.15, 0.52, 0.42, 0.52, '#9a622f', TEXTURE_URLS.wood.planks1, false));
		pieces.push(box(`Awtsmoos_market_gold_mitzvah_${index}`, x + 0.34, y + 1.22, z - 0.12, 0.18, 0.18, 0.18, '#f5c542', TEXTURE_URLS.metals.gold2, false));
	}
	return pieces;
}

function bridge(center, groundSampler) {
	const y = groundY(groundSampler, center.x, center.z) + 0.28;
	return [
		box('Awtsmoos_stream_bridge_deck', center.x, y, center.z, 5.8, 0.28, 2.2, '#87552b', TEXTURE_URLS.wood.planks1, true, { y: -0.25 }),
		box('Awtsmoos_stream_bridge_left_rail', center.x, y + 0.7, center.z - 1.25, 5.8, 0.18, 0.18, '#59381e', TEXTURE_URLS.wood.bark1, false, { y: -0.25 }),
		box('Awtsmoos_stream_bridge_right_rail', center.x, y + 0.7, center.z + 1.25, 5.8, 0.18, 0.18, '#59381e', TEXTURE_URLS.wood.bark1, false, { y: -0.25 }),
		box('Awtsmoos_bridge_stone_left', center.x - 2.5, y - 0.25, center.z, 0.7, 0.8, 2.5, '#77736a', TEXTURE_URLS.bricks.fieldstone1, true),
		box('Awtsmoos_bridge_stone_right', center.x + 2.5, y - 0.25, center.z, 0.7, 0.8, 2.5, '#77736a', TEXTURE_URLS.bricks.fieldstone1, true)
	];
}

function box(id, x, y, z, sx, sy, sz, color, textureUrl, solid = true, rotation = {}) {
	return { id, shape: 'box', position: { x, y, z }, rotation, size: { x: sx, y: sy, z: sz }, color, textureUrl, solid, mapRepeat: [1, 1], texturePolicy: { publicFirebase: true, villageProp: true } };
}

function cylinder(id, x, y, z, radius, height, color, textureUrl) {
	return { id, shape: 'cylinder', position: { x, y, z }, radius, height, segments: 14, color, textureUrl, solid: true, mapRepeat: [1, 2], texturePolicy: { publicFirebase: true, villageProp: true } };
}

function ring(count, radius) {
	return Array.from({ length: count }, (_, index) => {
		const angle = index / count * Math.PI * 2 + 0.22;
		return { x: Math.cos(angle) * radius, z: Math.sin(angle) * radius + 2 };
	});
}

function groundY(groundSampler, x, z) {
	return groundSampler.heightAt(x, z).y;
}
