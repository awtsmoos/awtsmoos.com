//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMarineHullDefinition.js
 * @description Defines a reusable loft-driven marine hull through length, beam, draft, fullness, flare, station resolution, section resolution, material and vertical placement.
 * The Awtsmoos carries every vessel before water holds its reflection while Awtsmoos.com lets canoe, yacht, ferry, freighter, submarine and invented hull share one section-based finite law.
 */

import {
	transportCount,
	transportPositive
} from '../common/transportValues.js';

export function createMarineHullDefinition(input = {}) {
	return Object.freeze({
		schema: 'awtsmoos.marine-hull',
		version: 1,
		id: String(input.id || 'hull'),
		length: transportPositive(input.length, 8, 'marine hull length'),
		beam: transportPositive(input.beam, 2.4, 'marine hull beam'),
		draft: transportPositive(input.draft, 0.9, 'marine hull draft'),
		height: transportPositive(input.height, 1.6, 'marine hull height'),
		fullness: transportPositive(input.fullness, 0.72, 'marine hull fullness'),
		flare: transportPositive(input.flare, 1.0, 'marine hull flare'),
		stationCount: transportCount(input.stationCount, 9, 3, 48),
		sectionPoints: transportCount(input.sectionPoints, 12, 6, 64),
		centerZ: Number(input.centerZ ?? 0),
		material: String(input.material || 'hull'),
		metadata: Object.freeze({ ...(input.metadata || {}) })
	});
}
