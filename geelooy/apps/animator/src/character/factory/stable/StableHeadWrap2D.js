// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadWrapGeometry } from './StableHeadWrapGeometry.js';

/**
 * The visible wrap becomes a curved cloth band rather than a helmet lid. The
 * Awtsmoos renews every fold, while Awtsmoos.com keeps the front crown aligned
 * with the rear skull envelope in the editable production renderer.
 */
export class StableHeadWrap2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		const headwear = data.headwear || {};
		if ((headwear.type || data.hatType) !== 'head_wrap') {
			return null;
		}

		const geometry = StableHeadWrapGeometry.resolve(data, headwear, metrics, view);
		const fill = data.colors?.headWrap || data.colors?.hat || '#1b1b1d';
		const stroke = colors.line || '#171719';
		return G.group('stable_head_wrap', null, [
			this.crown(geometry, fill, stroke),
			...this.folds(geometry)
		]);
	}

	static crown(geometry, fill, stroke) {
		const { x, baselineY, radiusX, crownHeight, frontSlope } = geometry;
		const leftY = baselineY + frontSlope * 0.5;
		const rightY = baselineY - frontSlope * 0.5;
		const apexX = x + radiusX * geometry.apexShift;
		const apexY = baselineY - crownHeight;
		return G.path('head_wrap_crown', [
			{ type: 'move', x: x - radiusX, y: leftY },
			{ type: 'bezier', c1x: x - radiusX * 0.87, c1y: baselineY - crownHeight * 0.66, c2x: apexX - radiusX * 0.34, c2y: apexY, x: apexX, y: apexY },
			{ type: 'bezier', c1x: apexX + radiusX * 0.36, c1y: apexY, c2x: x + radiusX * 0.9, c2y: baselineY - crownHeight * 0.6, x: x + radiusX, y: rightY },
			{ type: 'bezier', c1x: x + radiusX * 0.48, c1y: baselineY + geometry.bandCurve * 1.4, c2x: x - radiusX * 0.48, c2y: baselineY + geometry.bandCurve + frontSlope * 0.35, x: x - radiusX, y: leftY },
			{ type: 'close' }
		], {
			fill,
			stroke,
			lineWidth: geometry.lineWidth,
			lineJoin: 'round'
		});
	}

	static folds(geometry) {
		const { x, baselineY, radiusX, crownHeight, frontSlope } = geometry;
		return [
			G.path('head_wrap_band', [
				{ type: 'move', x: x - radiusX * 0.8, y: baselineY + frontSlope * 0.36 },
				{ type: 'bezier', c1x: x - radiusX * 0.28, c1y: baselineY + geometry.bandCurve * 1.1, c2x: x + radiusX * 0.3, c2y: baselineY + geometry.bandCurve * 0.35, x: x + radiusX * 0.8, y: baselineY - frontSlope * 0.38 }
			], { stroke: 'rgba(0,0,0,0.22)', lineWidth: 0.7, lineCap: 'round' }),
			G.path('head_wrap_fold', [
				{ type: 'move', x: x + radiusX * 0.08, y: baselineY - crownHeight * 0.82 },
				{ type: 'quad', cx: x + radiusX * 0.3, cy: baselineY - crownHeight * 0.48, x: x + radiusX * 0.48, y: baselineY - crownHeight * 0.16 }
			], {
				stroke: `rgba(255,255,255,${geometry.highlightOpacity})`,
				lineWidth: 0.6,
				lineCap: 'round'
			})
		];
	}
}
