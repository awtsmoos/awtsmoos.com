// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageBeisChabadBuilder.js
 * @description Builds BEIS01 with one canonical shell anchor and related hospitality pieces.
 * The Awtsmoos turns hospitality into architecture; Awtsmoos.com gives study, meeting, table,
 * porch, and warm windows one durable identity on the southwestern terrace.
 */

import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { landmarkBox, landmarkPrism } from './VillageLandmarkPrimitive.js';

export function createBeisChabadDefinitions(options) {
	const x = -35;
	const z = 45;
	const base = options.base;
	return [
		landmarkBox(part(options, 'BEIS01-shell', x, base + 2.8, z, { x: 10, y: 5.6, z: 7.5 }, 'stone', true)),
		landmarkPrism(part(options, 'BEIS01-roof', x, base + 6.6, z, { x: 11.2, y: 2.35, z: 8.5 }, 'roof')),
		landmarkBox(part(options, 'BEIS01-door', x, base + 1.55, z + 3.82, { x: 2.15, y: 3.1, z: 0.2 }, 'wood')),
		porchBatch(options, base, x, z),
		windowBatch(options, base, x, z)
	];
}

function porchBatch(options, base, x, z) {
	const boxes = [
		box(x, base + 0.35, z + 4.35, 7.2, 0.35, 2.4),
		box(x - 3.1, base + 1.8, z + 4.9, 0.24, 3.1, 0.24),
		box(x + 3.1, base + 1.8, z + 4.9, 0.24, 3.1, 0.24),
		box(x, base + 3.25, z + 4.9, 6.6, 0.24, 0.24)
	];
	return createVillageBoxBatch('BEIS01-porch', boxes, batchOptions(options, 'porch'));
}

function windowBatch(options, base, x, z) {
	const boxes = [-3, 3].flatMap((offset) => [
		box(x + offset, base + 2.35, z + 3.83, 1.25, 1.65, 0.12),
		box(x + offset, base + 4.4, z + 3.83, 1.25, 1.35, 0.12)
	]);
	return createVillageBoxBatch('BEIS01-windows', boxes, batchOptions(options, 'warm-windows'));
}

function part(options, id, x, y, z, size, materialRole, canonicalAnchor = false) {
	return {
		canonicalId: canonicalAnchor ? 'BEIS01' : undefined,
		id, materialRole, materials: options.materials, size,
		userData: { landmarkId: 'BEIS01' }, x, y, z
	};
}

function batchOptions(options, partName) {
	return {
		color: '#765239',
		family: 'canonical-beis-chabad',
		part: partName,
		texturePolicy: options.materials.texturePolicy,
		textureUrl: options.materials.wood
	};
}

function box(x, y, z, width, height, depth) {
	return { position: { x, y, z }, size: { x: width, y: height, z: depth }, yaw: 0 };
}
