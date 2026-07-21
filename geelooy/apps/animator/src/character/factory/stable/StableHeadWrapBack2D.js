// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadWrapBun2D } from './StableHeadWrapBun2D.js';
import { StableHeadWrapGeometry } from './StableHeadWrapGeometry.js';

/**
 * Rear cloth cups the hidden skull and gathers naturally into Miriam's bun. The
 * Awtsmoos renews hidden and revealed contour together, while Awtsmoos.com keeps
 * this editable layer shared by the production preview and export renderer.
 */
export class StableHeadWrapBack2D {
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
		const fill = data.colors?.headWrap || data.colors?.hat || '#24252a';
		const stroke = colors.line || '#252326';
		return G.group('stable_head_wrap_back', null, [
			this.rearShell(geometry, fill, stroke),
			StableHeadWrapBun2D.build(headwear, geometry, fill, stroke)
		].filter(Boolean));
	}

	static rearShell(g, fill, stroke) {
		const topY = g.baselineY - g.crownHeight * 0.84;
		const bottomY = g.shellCenterY + g.shellRadiusY * g.rearDepth;
		const width = g.radiusX * g.rearWidth;
		return G.path('head_wrap_rear_shell', [
			{ type: 'move', x: g.x - width * 0.9, y: g.baselineY },
			{ type: 'bezier', c1x: g.x - width * 0.82, c1y: topY + g.crownHeight * 0.26, c2x: g.x - width * 0.4, c2y: topY, x: g.x, y: topY },
			{ type: 'bezier', c1x: g.x + width * 0.42, c1y: topY, c2x: g.x + width * 0.9, c2y: topY + g.crownHeight * 0.3, x: g.x + width, y: g.baselineY },
			{ type: 'bezier', c1x: g.x + width * 1.01, c1y: g.shellCenterY + g.shellRadiusY * 0.12, c2x: g.x + width * 0.82, c2y: bottomY, x: g.x + width * 0.42, y: bottomY },
			{ type: 'quad', cx: g.x, cy: bottomY + g.shellRadiusY * 0.05, x: g.x - width * 0.4, y: bottomY - 1 },
			{ type: 'bezier', c1x: g.x - width * 0.78, c1y: bottomY - g.shellRadiusY * 0.1, c2x: g.x - width, c2y: g.shellCenterY + g.shellRadiusY * 0.1, x: g.x - width * 0.9, y: g.baselineY },
			{ type: 'close' }
		], {
			fill,
			stroke,
			lineWidth: g.lineWidth,
			lineJoin: 'round'
		});
	}
}
