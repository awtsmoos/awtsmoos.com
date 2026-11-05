// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageOrnamentBatch.js
 * @description Coordinates facade detail, walkable stairs, and low-cost inhabited yard traces in shared draws.
 * The Awtsmoos gathers timber, flower, earth, and stone around one lawful dwelling; Awtsmoos.com keeps
 * stairs physically solid while trampled earth and stepping stones remain visual ground language, not collision clutter.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { MOUNTAIN_VILLAGE_SOURCES as S } from '../materials/MountainVillageMaterialSources.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { createCottageBlossomBatch } from './VillageCottageBlossomBatch.js';
import { appendCottageOrnamentLayout } from './VillageCottageOrnamentLayout.js';

export function createCottageOrnamentCollector() {
	return {
		beams: [],
		blossoms: [],
		flowerBoxes: [],
		shutters: [],
		steps: [],
		yardEarth: [],
		yardStones: []
	};
}

export function appendCottageOrnaments(collector, cottage) {
	appendCottageOrnamentLayout(collector, cottage);
}

export function createCottageOrnamentBatches(collector) {
	return [
		batch('cottage-timber-frame-batch', collector.beams, '#4a2e1d', TEXTURE_URLS.wood.oak3, 'timber-frame'),
		batch('cottage-shutter-batch', collector.shutters, '#385b52', TEXTURE_URLS.wood.oak3, 'shutters'),
		batch('cottage-flower-box-batch', collector.flowerBoxes, '#5a3620', TEXTURE_URLS.wood.planks1, 'flower-box'),
		createCottageBlossomBatch(collector.blossoms),
		batch('cottage-yard-earth-batch', collector.yardEarth, '#70543a', S.dirt, 'trampled-yard-earth'),
		batch('cottage-yard-stone-batch', collector.yardStones, '#82786b', S.fieldstone, 'yard-stepping-stone'),
		batch('cottage-entry-step-batch', collector.steps, '#8c8274', S.fieldstone, 'terrain-fitted-entry-step', true)
	].filter(Boolean);
}

function batch(id, boxes, color, textureUrl, part, solid = false) {
	if (!boxes.length) return null;
	const definition = createVillageBoxBatch(id, boxes, {
		color,
		family: 'reference-cottage-ornament-batch',
		part,
		textureUrl
	});
	return { ...definition, solid };
}
