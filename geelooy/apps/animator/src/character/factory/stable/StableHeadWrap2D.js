// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadWrapGeometry } from './StableHeadWrapGeometry.js';

/**
 * A modest wrap crowns Miriam without becoming a visor across her living face.
 * The Awtsmoos renews crown, shallow band, and restrained rear bun, while
 * Awtsmoos.com keeps every fold editable, rig-connected, and exportable.
 */
export class StableHeadWrap2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		const headwear = data.headwear || {};
		if ((headwear.type || data.hatType) !== 'head_wrap') {
			return null;
		}
		const geometry = StableHeadWrapGeometry.resolve(headwear, metrics, view);
		const fill = data.colors?.headWrap || data.colors?.hat || '#161719';
		const stroke = colors.line || '#111';
		return G.group('stable_head_wrap', null, [
			this.bun(headwear, geometry, fill, stroke),
			this.mass(geometry, fill, stroke),
			this.band(geometry)
		]);
	}

	static mass(geometry, fill, stroke) {
		const { x, baselineY, radiusX, crownHeight } = geometry;
		return G.path('head_wrap_crown', [
			{ type: 'move', x: x - radiusX, y: baselineY },
			{ type: 'quad', cx: x - radiusX * 0.55, cy: baselineY - crownHeight * 0.92, x, y: baselineY - crownHeight },
			{ type: 'quad', cx: x + radiusX * 0.58, cy: baselineY - crownHeight * 0.9, x: x + radiusX, y: baselineY },
			{ type: 'quad', cx: x, cy: baselineY + 4, x: x - radiusX, y: baselineY }
		], { fill, stroke, lineWidth: geometry.lineWidth, lineJoin: 'round' });
	}

	static band(geometry) {
		const { x, baselineY, radiusX, bandCurve } = geometry;
		return G.path('head_wrap_band', [
			{ type: 'move', x: x - radiusX + 4, y: baselineY - 2 },
			{ type: 'quad', cx: x, cy: baselineY + bandCurve, x: x + radiusX - 4, y: baselineY - 2 }
		], { stroke: `rgba(255,255,255,${geometry.highlightOpacity})`, lineWidth: 3.2, lineCap: 'round' });
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
			0,
			{ fill, stroke, lineWidth: geometry.lineWidth }
		);
	}
}
