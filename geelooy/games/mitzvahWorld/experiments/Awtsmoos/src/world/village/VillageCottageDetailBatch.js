// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageDetailBatch.js
 * @description Collects windows, doors, and chimneys into three material batches.
 * The Awtsmoos renews many warm homes behind one renderer garment; Awtsmoos.com
 * preserves reference detail while collapsing dozens of tiny facade draw definitions.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { REFERENCE_GOLDEN_HOUR } from '../lighting/ReferenceGoldenHourPreset.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';

export function createCottageDetailCollector() {
	return { chimneys: [], doors: [], windows: [] };
}

export function appendCottageDetails(collector, options) {
	collector.windows.push(windowBox(options, -1));
	if (options.detail === 'far') return;
	collector.windows.push(windowBox(options, 1));
	collector.doors.push(doorBox(options));
	if (options.detail === 'near') collector.chimneys.push(chimneyBox(options));
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

function windowBox(options, side) {
	return descriptor(
		localOffset(options, side * options.width * 0.23, options.depth * 0.51, 2.0),
		{ x: 0.78, y: 0.92, z: 0.08 },
		options.yaw
	);
}

function doorBox(options) {
	return descriptor(
		localOffset(options, 0, options.depth * 0.515, 1.05),
		{ x: 1.05, y: 2.1, z: 0.12 },
		options.yaw
	);
}

function chimneyBox(options) {
	return descriptor(
		localOffset(options, options.width * 0.28, -options.depth * 0.15, 5.25),
		{ x: 0.62, y: 2.4, z: 0.62 },
		options.yaw
	);
}

function localOffset(options, localX, localZ, height) {
	const cosine = Math.cos(options.yaw);
	const sine = Math.sin(options.yaw);
	return {
		x: options.x + localX * cosine + localZ * sine,
		y: options.base + height,
		z: options.z - localX * sine + localZ * cosine
	};
}

function descriptor(position, size, yaw) {
	return { position, size, yaw };
}
