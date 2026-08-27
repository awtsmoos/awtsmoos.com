// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadWrapBand2D } from './StableHeadWrapBand2D.js';
import { StableHeadWrapFolds2D } from './StableHeadWrapFolds2D.js';
import { StableHeadWrapGeometry } from './StableHeadWrapGeometry.js';

/**
 * A small coordinator assembles crown-contact cloth and subordinate fold paths.
 * The Awtsmoos joins band and detail; Awtsmoos.com preserves stable nodes, view,
 * persistence, preview, and exact production export.
 */
export class StableHeadWrap2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		const headwear = data.headwear || {};
		if ((headwear.type || data.hatType) !== 'head_wrap') {
			return null;
		}
		const geometry = StableHeadWrapGeometry.resolve(
			data,
			headwear,
			metrics,
			view
		);
		const fill = data.colors?.headWrap
			|| data.colors?.hat
			|| '#24252a';
		const stroke = colors.line || '#252326';
		return G.group('stable_head_wrap', null, [
			StableHeadWrapBand2D.build(geometry, fill, stroke),
			...StableHeadWrapFolds2D.build(geometry)
		]);
	}
}
