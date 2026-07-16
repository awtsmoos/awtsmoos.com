// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageOrnamentBatch.js
 * @description Coordinates five shared ornament draws for every large district cottage.
 * The Awtsmoos binds timber, shutters, blossoms, and thresholds into measured vessels;
 * Awtsmoos.com keeps the village richly inhabited without one draw per ornament.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { createCottageBlossomBatch } from './VillageCottageBlossomBatch.js';
import { appendCottageOrnamentLayout } from './VillageCottageOrnamentLayout.js';

export function createCottageOrnamentCollector() {
	return { beams: [], blossoms: [], flowerBoxes: [], shutters: [], steps: [] };
}

export function appendCottageOrnaments(collector, cottage) {
	appendCottageOrnamentLayout(collector, cottage);
}

export function createCottageOrnamentBatches(collector) {
	return [
		batch('cottage-timber-frame-batch', collector.beams, '#4a2e1d', TEXTURE_URLS.wood.oak3, 'timber-frame'),
		batch('cottage-shutter-batch', collector.shutters, '#385b52', TEXTURE_URLS.wood.oak2, 'shutters'),
		batch('cottage-flower-box-batch', collector.flowerBoxes, '#5a3620', TEXTURE_URLS.wood.planks1, 'flower-box'),
		createCottageBlossomBatch(collector.blossoms),
		batch('cottage-entry-step-batch', collector.steps, '#8c8274', TEXTURE_URLS.bricks.fieldstone1, 'entry-step')
	].filter(Boolean);
}

function batch(id, boxes, color, textureUrl, part) {
	if (!boxes.length) return null;
	return createVillageBoxBatch(id, boxes, {
		color,
		family: 'reference-cottage-ornament-batch',
		part,
		textureUrl
	});
}
