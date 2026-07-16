// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadWrapGeometry } from './StableHeadWrapGeometry.js';

/**
 * A modest wrap is revealed as crown, layered band, and rear bun rather than a
 * generic dark oval. The Awtsmoos renews every fold, while Awtsmoos.com keeps
 * Miriam's head covering editable, rig-connected, serializable, and exportable.
 */
export class StableHeadWrap2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		const headwear = data.headwear || {};
		const type = headwear.type || data.hatType;
		if (type !== 'head_wrap') {
			return null;
		}
		const geometry = StableHeadWrapGeometry.resolve(
			headwear,
			metrics,
			view
		);
		const fill = data.colors?.headWrap
			|| data.colors?.hat
			|| '#161719';
		const stroke = colors.line || '#111';
		return G.group('stable_head_wrap', null, [
			this.mass(geometry, fill, stroke),
			this.band(geometry),
			this.bun(headwear, geometry, fill, stroke)
		]);
	}

	static mass(geometry, fill, stroke) {
		const { x, y, radiusX, radiusY } = geometry;
		return G.path('head_wrap_mass', [
			{
				type: 'move',
				x: x - radiusX,
				y: y + radiusY * 0.46
			},
			{
				type: 'quad',
				cx: x,
				cy: y - radiusY,
				x: x + radiusX,
				y: y + radiusY * 0.46
			},
			{
				type: 'quad',
				cx: x,
				cy: y + radiusY * 0.9,
				x: x - radiusX,
				y: y + radiusY * 0.46
			}
		], {
			fill,
			stroke,
			lineWidth: geometry.lineWidth,
			lineJoin: 'round'
		});
	}

	static band(geometry) {
		const { x, y, radiusX, bandY, bandCurve } = geometry;
		return G.path('head_wrap_band', [
			{
				type: 'move',
				x: x - radiusX + 4,
				y: y + bandY
			},
			{
				type: 'quad',
				cx: x,
				cy: y + bandY + bandCurve,
				x: x + radiusX - 4,
				y: y + bandY
			}
		], {
			stroke: `rgba(255,255,255,${geometry.highlightOpacity})`,
			lineWidth: 4,
			lineCap: 'round'
		});
	}

	static bun(headwear, geometry, fill, stroke) {
		if (headwear.bun === false) {
			return null;
		}
		const side = headwear.rearBun === false
			? 0.72
			: geometry.bunX;
		return G.ellipse(
			'head_wrap_bun',
			geometry.x + geometry.radiusX * side,
			geometry.y + geometry.radiusY * geometry.bunY,
			geometry.radiusX * geometry.bunWidth,
			geometry.radiusY * geometry.bunHeight,
			0,
			{
				fill,
				stroke,
				lineWidth: geometry.lineWidth
			}
		);
	}
}
