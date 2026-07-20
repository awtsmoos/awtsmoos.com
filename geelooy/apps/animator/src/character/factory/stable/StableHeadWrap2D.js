// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadWrapGeometry } from './StableHeadWrapGeometry.js';

/**
 * A layered wrap crowns Miriam without becoming a visor. The Awtsmoos renews
 * every fold and compact bun, while Awtsmoos.com keeps them editable, rigged,
 * serializable, and identical across production preview and export.
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
		const fill = data.colors?.headWrap || data.colors?.hat || '#161719';
		const stroke = colors.line || '#111';
		return G.group('stable_head_wrap', null, [
			this.bun(headwear, geometry, fill, stroke),
			this.mass(geometry, fill, stroke),
			...this.folds(geometry)
		]);
	}

	static mass(geometry, fill, stroke) {
		const { x, baselineY, radiusX, crownHeight } = geometry;
		return G.path('head_wrap_crown', [
			{ type: 'move', x: x - radiusX, y: baselineY },
			{ type: 'bezier', c1x: x - radiusX * 0.82, c1y: baselineY - crownHeight * 0.8, c2x: x - radiusX * 0.35, c2y: baselineY - crownHeight, x, y: baselineY - crownHeight },
			{ type: 'bezier', c1x: x + radiusX * 0.38, c1y: baselineY - crownHeight, c2x: x + radiusX * 0.82, c2y: baselineY - crownHeight * 0.76, x: x + radiusX, y: baselineY },
			{ type: 'quad', cx: x, cy: baselineY + 5, x: x - radiusX, y: baselineY }
		], {
			fill,
			stroke,
			lineWidth: geometry.lineWidth,
			lineJoin: 'round'
		});
	}

	static folds(geometry) {
		const { x, baselineY, radiusX, crownHeight } = geometry;
		const stroke = `rgba(255,255,255,${geometry.highlightOpacity})`;
		return [
			G.path('head_wrap_band', [
				{ type: 'move', x: x - radiusX + 5, y: baselineY - 2 },
				{ type: 'quad', cx: x, cy: baselineY + geometry.bandCurve, x: x + radiusX - 5, y: baselineY - 2 }
			], { stroke, lineWidth: 2.5, lineCap: 'round' }),
			G.path('head_wrap_fold', [
				{ type: 'move', x: x + radiusX * 0.18, y: baselineY - crownHeight * 0.9 },
				{ type: 'quad', cx: x + radiusX * 0.5, cy: baselineY - crownHeight * 0.48, x: x + radiusX * 0.68, y: baselineY - 3 }
			], { stroke, lineWidth: 1.4, lineCap: 'round' })
		];
	}

	static bun(headwear, geometry, fill, stroke) {
		if (headwear.bun === false) {
			return null;
		}
		return G.ellipse(
			'head_wrap_bun',
			geometry.x + geometry.radiusX * geometry.bunX,
			geometry.baselineY + geometry.crownHeight * geometry.bunY,
			geometry.radiusX * geometry.bunWidth,
			geometry.crownHeight * geometry.bunHeight,
			0.05,
			{ fill, stroke, lineWidth: geometry.lineWidth }
		);
	}
}
