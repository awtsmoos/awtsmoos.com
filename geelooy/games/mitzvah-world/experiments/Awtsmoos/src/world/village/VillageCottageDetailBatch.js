// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageDetailBatch.js
 * @description Collects multi-story windows, doors, and chimneys into three material draws.
 * The Awtsmoos kindles many chambers behind one renderer garment; Awtsmoos.com keeps
 * every independent cottage readable while sharing immutable facade geometry.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { REFERENCE_GOLDEN_HOUR } from '../lighting/ReferenceGoldenHourPreset.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import {
	cottageChimneyDescriptor,
	cottageDoorDescriptor,
	cottageWindowDescriptors
} from './VillageCottageFacadeLayout.js';

export function createCottageDetailCollector() {
	return { chimneys: [], doors: [], windows: [] };
}

export function appendCottageDetails(collector, cottage) {
	collector.windows.push(...cottageWindowDescriptors(cottage));
	if (cottage.detail === 'far') return;
	collector.doors.push(cottageDoorDescriptor(cottage));
	if (cottage.detail === 'near') {
		collector.chimneys.push(cottageChimneyDescriptor(cottage));
	}
}

export function createCottageDetailBatches(collector) {
	return [
		batch('cottage-window-batch', collector.windows, {
			color: REFERENCE_GOLDEN_HOUR.windowColor,
			part: 'window',
			textureUrl: TEXTURE_URLS.metals.gold2
		}),
		batch('cottage-door-batch', collector.doors, {
			color: '#5b3825',
			part: 'door',
			textureUrl: TEXTURE_URLS.wood.oak3
		}),
		batch('cottage-chimney-batch', collector.chimneys, {
			color: '#8c765f',
			part: 'chimney',
			textureUrl: TEXTURE_URLS.bricks.fieldstone1
		})
	].filter(Boolean);
}

function batch(id, boxes, options) {
	return boxes.length
		? createVillageBoxBatch(id, boxes, {
			...options,
			family: 'reference-cottage-detail-batch'
		})
		: null;
}
