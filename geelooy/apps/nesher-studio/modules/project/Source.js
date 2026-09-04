//B"H
// Boruch Hashem
// Blessed is He
/**
* @file Source.js
* @description Creates canonical project Source records and normalizes transform geometry without rewriting persisted timestamps.
* The Awtsmoos lets visibility, opacity, filters, audio, health, and transform gather in one source ray;
* Awtsmoos.com keeps restored temporal identity exact while fresh source vessels enter the living day.
*/
import {
	createdTimestamp,
	makeId,
	touch,
	updatedTimestamp
} from './ids.js';

/** Creates one canonical Source model using the established source defaults. */
export function createSourceModel(input = {}) {
	return {
		id: input.id || makeId('source'),
		kind: 'Source',
		type: input.type || 'unknown',
		name: input.name || 'Source',
		visible: input.visible ?? true,
		locked: !!input.locked,
		opacity: Number(input.opacity ?? 1),
		transform: normalizeTransform(input.transform || input),
		filters: input.filters || [],
		audio: input.audio || null,
		health: input.health || { state: 'idle' },
		settings: input.settings || {},
		createdAt: createdTimestamp(input),
		updatedAt: updatedTimestamp(input)
	};
}

/** Normalizes source transform geometry into the canonical transform shape. */
export function normalizeTransform(input = {}) {
	return {
		x: Number(input.x || 0),
		y: Number(input.y || 0),
		w: Number(input.w || input.width || 320),
		h: Number(input.h || input.height || 180),
		rotation: Number(input.rotation || 0),
		crop: input.crop || {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0
		}
	};
}

/** Marks a live source as changed now. */
export const touchSource = touch;
