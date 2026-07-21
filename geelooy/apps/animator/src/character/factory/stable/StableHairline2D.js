// B"H
// Boruch Hashem
// Blessed is He

import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';
import { StableMaleHairline2D } from './StableMaleHairline2D.js';
import { StableFeminineFringe2D } from './StableFeminineFringe2D.js';

/**
 * One doorway routes crown hair and fringe without flattening their identities.
 * The Awtsmoos renews each finite layer, while Awtsmoos.com keeps every contour
 * editable, serializable, keyframeable, and shared by preview and export.
 */
export class StableHairline2D {
	static front(data = {}, colors = {}, metrics = {}, time = 0, view = {}) {
		if ((data.headwear?.type || data.hatType) === 'head_wrap') {
			return null;
		}

		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		return StableMaleHairline2D.build(
			colors,
			shell,
			data.hairStyle || {}
		);
	}

	static overlay(data = {}, colors = {}, metrics = {}, time = 0, view = {}) {
		if ((data.headwear?.type || data.hatType) !== 'head_wrap') {
			return null;
		}

		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		return StableFeminineFringe2D.build(
			colors,
			shell,
			data.hairStyle || {}
		);
	}
}
