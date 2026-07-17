// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageMarketBuilder.js
 * @description Builds MARKET01 with one hall anchor and an inhabited timber-and-canvas square.
 * The Awtsmoos lets honest exchange become fellowship rather than clutter; Awtsmoos.com
 * names the market once while stalls, awnings, and circulation remain related measured parts.
 */

import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { landmarkBox, landmarkPrism } from './VillageLandmarkPrimitive.js';

const STALL_LOCATIONS = Object.freeze([[-39, 18], [-33, 22], [-21, 23], [-15, 18], [-37, 7], [-17, 7]]);

export function createMarketDefinitions(options) {
	const x = -26;
	const z = 12;
	const base = options.base;
	return [
		landmarkBox(part(options, 'MARKET01-hall', x, base + 2.75, z, { x: 11, y: 5.5, z: 7.5 }, 'stone', true)),
		landmarkPrism(part(options, 'MARKET01-roof', x, base + 6.45, z, { x: 12, y: 2.2, z: 8.5 }, 'roof')),
		landmarkBox(part(options, 'MARKET01-door', x, base + 1.55, z + 3.82, { x: 2.4, y: 3.1, z: 0.18 }, 'wood')),
		stallBatch(options, base),
		awningBatch(options, base)
	];
}

function stallBatch(options, base) {
	const boxes = STALL_LOCATIONS.flatMap(([x, z]) => [
		box(x, base + 0.85, z, 3.8, 1.15, 1.7),
		box(x - 1.65, base + 2.1, z, 0.18, 2.6, 0.18),
		box(x + 1.65, base + 2.1, z, 0.18, 2.6, 0.18)
	]);
	return createVillageBoxBatch('MARKET01-stalls', boxes, batchOptions(options, options.materials.wood, 'stalls'));
}

function awningBatch(options, base) {
	const boxes = STALL_LOCATIONS.map(([x, z], index) => ({
		position: { x, y: base + 3.05, z },
		size: { x: 4.3, y: 0.18, z: 2.3 },
		yaw: index % 2 === 0 ? 0.08 : -0.08
	}));
	return createVillageBoxBatch('MARKET01-awnings', boxes, batchOptions(options, options.materials.roof, 'awnings'));
}

function part(options, id, x, y, z, size, materialRole, canonicalAnchor = false) {
	return {
		canonicalId: canonicalAnchor ? 'MARKET01' : undefined,
		id, materialRole, materials: options.materials, size,
		userData: { landmarkId: 'MARKET01' }, x, y, z
	};
}

function batchOptions(options, textureUrl, partName) {
	return {
		color: partName === 'awnings' ? '#b49a72' : '#765239',
		family: 'canonical-market-square', part: partName,
		texturePolicy: options.materials.texturePolicy, textureUrl
	};
}

function box(x, y, z, width, height, depth) {
	return { position: { x, y, z }, size: { x: width, y: height, z: depth }, yaw: 0 };
}
