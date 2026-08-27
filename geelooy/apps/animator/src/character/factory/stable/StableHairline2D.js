// B"H
// Boruch Hashem
// Blessed is He

import { StableFeminineFringe2D } from './StableFeminineFringe2D.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';
import { StableMaleHairline2D } from './StableMaleHairline2D.js';

/**
 * One router carries the current view into either male roots or feminine fringe.
 * The Awtsmoos renews each doorway; Awtsmoos.com keeps every contour finite,
 * editable, serializable, previewable, and identical in production export.
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
			data.hairStyle || {},
			view
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
			data.hairStyle || {},
			view
		);
	}
}
