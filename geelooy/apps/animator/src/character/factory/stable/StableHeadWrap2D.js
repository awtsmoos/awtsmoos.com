// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadWrapGeometry } from './StableHeadWrapGeometry.js';

/**
 * Miriam's visible wrap follows the crown as layered cloth, never a hard helmet.
 * The Awtsmoos renews each fold, while Awtsmoos.com keeps the front band aligned
 * with the rear silhouette in editable preview and authoritative export.
 */
export class StableHeadWrap2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		const headwear = data.headwear || {};
		if ((headwear.type || data.hatType) !== 'head_wrap') {
			return null;
		}
		const geometry = StableHeadWrapGeometry.resolve(data, headwear, metrics, view);
		const fill = data.colors?.headWrap || data.colors?.hat || '#24252a';
		const stroke = colors.line || '#252326';
		return G.group('stable_head_wrap', null, [
			this.crown(geometry, fill, stroke),
			...this.folds(geometry)
		]);
	}

	static crown(g, fill, stroke) {
		const leftY = g.baselineY + g.frontSlope * 0.48;
		const rightY = g.baselineY - g.frontSlope * 0.52;
		const apexX = g.x + g.radiusX * g.apexShift;
		const apexY = g.baselineY - g.crownHeight;
		return G.path('head_wrap_crown', [
			{ type: 'move', x: g.x - g.radiusX, y: leftY },
			{ type: 'bezier', c1x: g.x - g.radiusX * 0.88, c1y: apexY + g.crownHeight * 0.44, c2x: apexX - g.radiusX * 0.4, c2y: apexY, x: apexX, y: apexY },
			{ type: 'bezier', c1x: apexX + g.radiusX * 0.42, c1y: apexY, c2x: g.x + g.radiusX * 0.9, c2y: apexY + g.crownHeight * 0.45, x: g.x + g.radiusX, y: rightY },
			{ type: 'bezier', c1x: g.x + g.radiusX * 0.46, c1y: g.baselineY + g.bandCurve, c2x: g.x - g.radiusX * 0.42, c2y: g.baselineY + g.bandCurve * 1.25, x: g.x - g.radiusX, y: leftY },
			{ type: 'close' }
		], {
			fill,
			stroke,
			lineWidth: g.lineWidth,
			lineJoin: 'round'
		});
	}

	static folds(g) {
		return [
			G.path('head_wrap_band', [
				{ type: 'move', x: g.x - g.radiusX * 0.78, y: g.baselineY + g.frontSlope * 0.32 },
				{ type: 'bezier', c1x: g.x - g.radiusX * 0.28, c1y: g.baselineY + g.bandCurve, c2x: g.x + g.radiusX * 0.34, c2y: g.baselineY + g.bandCurve * 0.12, x: g.x + g.radiusX * 0.78, y: g.baselineY - g.frontSlope * 0.36 }
			], { stroke: 'rgba(15,15,18,0.22)', lineWidth: 0.65, lineCap: 'round' }),
			G.path('head_wrap_fold', [
				{ type: 'move', x: g.x + g.radiusX * 0.1, y: g.baselineY - g.crownHeight * 0.8 },
				{ type: 'quad', cx: g.x + g.radiusX * 0.28, cy: g.baselineY - g.crownHeight * 0.47, x: g.x + g.radiusX * 0.47, y: g.baselineY - g.crownHeight * 0.18 }
			], {
				stroke: `rgba(255,255,255,${g.highlightOpacity})`,
				lineWidth: 0.55,
				lineCap: 'round'
			})
		];
	}
}
