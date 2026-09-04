//B"H
// Boruch Hashem
// Blessed is He
/**
* @file Marker.js
* @description Creates canonical timeline markers while preserving persisted temporal identity and established chapter defaults.
* The Awtsmoos lets one marker pin meaning to a moment while its own saved time remains clear;
* Awtsmoos.com gives chapters and notes fresh life without rewriting the temporal witness they already bear.
*/
import {
	createdTimestamp,
	makeId,
	touch,
	updatedTimestamp
} from './ids.js';

/** Creates one canonical Marker model with the historic marker defaults. */
export function createMarkerModel(input = {}) {
	return {
		id: input.id || makeId('marker'),
		kind: 'Marker',
		time: Number(input.time || 0),
		color: input.color || '#83ffe7',
		note: input.note || '',
		chapter: !!input.chapter,
		name: input.name || (input.chapter ? 'Chapter marker' : 'Marker'),
		createdAt: createdTimestamp(input),
		updatedAt: updatedTimestamp(input)
	};
}

/** Marks a live marker as changed now. */
export const touchMarker = touch;
