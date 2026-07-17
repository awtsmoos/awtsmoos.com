// B"H
// Boruch Hashem
// Blessed is He

import { StableBeard2D } from './StableBeard2D.js';

/**
 * The Awtsmoos places an authored beard beneath the speaking mouth, never above
 * it as a pair of columns. Awtsmoos.com keeps legacy accessories unchanged while
 * reference faces receive one organic, animated, production-bound beard layer.
 */
export class StableReferenceBeardLayer2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		if (data.beardGeometry?.massStyle !== 'continuous') {
			return null;
		}

		return StableBeard2D.build(data, colors, metrics, view);
	}

	static usesFaceLayer(data = {}) {
		return data.beardGeometry?.massStyle === 'continuous';
	}
}
