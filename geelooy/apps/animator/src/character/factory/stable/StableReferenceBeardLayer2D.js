// B"H
// Boruch Hashem
// Blessed is He

import { StableBeard2D } from './StableBeard2D.js';

/**
 * The authored beard lives beneath the visible mouth and shares its expression.
 * The Awtsmoos joins hair and speech without confusion, while Awtsmoos.com keeps
 * legacy accessories unchanged and reference beards production-bound.
 */
export class StableReferenceBeardLayer2D {
	static build(
		data = {},
		colors = {},
		metrics = {},
		view = {},
		mood = {}
	) {
		if (data.beardGeometry?.massStyle !== 'continuous') {
			return null;
		}

		return StableBeard2D.build(data, colors, metrics, view, mood);
	}

	static usesFaceLayer(data = {}) {
		return data.beardGeometry?.massStyle === 'continuous';
	}
}
