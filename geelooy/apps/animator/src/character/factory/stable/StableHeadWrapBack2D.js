// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadWrapBun2D } from './StableHeadWrapBun2D.js';
import { StableHeadWrapGeometry } from './StableHeadWrapGeometry.js';

/**
 * Cloth surrounds the hidden rear skull before the face is drawn. The Awtsmoos
 * renews front and back as one truth, while Awtsmoos.com keeps Miriam's wrap
 * and compact bun editable, serializable, and shared by preview and export.
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
		const fill = data.colors?.headWrap || data.colors?.hat || '#1b1b1d';
		const stroke = colors.line || '#171719';
		return G.group('stable_head_wrap_back', null, [
			this.rearShell(geometry, fill, stroke),
			StableHeadWrapBun2D.build(headwear, geometry, fill, stroke)
		].filter(Boolean));
	}

	static rearShell(geometry, fill, stroke) {
		const { x, radiusX, baselineY, crownHeight } = geometry;
		const topY = baselineY - crownHeight * 0.82;
		const bottomY = geometry.shellCenterY
			+ geometry.shellRadiusY * geometry.rearDepth;
		const sideWidth = radiusX * geometry.rearWidth;
		return G.path('head_wrap_rear_shell', [
			{ type: 'move', x: x - sideWidth * 0.9, y: baselineY },
			{ type: 'bezier', c1x: x - sideWidth * 0.82, c1y: topY + crownHeight * 0.28, c2x: x - sideWidth * 0.38, c2y: topY, x, y: topY },
			{ type: 'bezier', c1x: x + sideWidth * 0.42, c1y: topY, c2x: x + sideWidth * 0.94, c2y: topY + crownHeight * 0.36, x: x + sideWidth, y: baselineY + geometry.frontSlope * 0.2 },
			{ type: 'bezier', c1x: x + sideWidth * 1.03, c1y: geometry.shellCenterY + geometry.shellRadiusY * 0.18, c2x: x + sideWidth * 0.88, c2y: bottomY, x: x + sideWidth * 0.48, y: bottomY },
			{ type: 'quad', cx: x, cy: bottomY + geometry.shellRadiusY * 0.08, x: x - sideWidth * 0.42, y: bottomY - geometry.shellRadiusY * 0.03 },
			{ type: 'bezier', c1x: x - sideWidth * 0.82, c1y: bottomY - geometry.shellRadiusY * 0.14, c2x: x - sideWidth, c2y: geometry.shellCenterY + geometry.shellRadiusY * 0.12, x: x - sideWidth * 0.9, y: baselineY },
			{ type: 'close' }
		], {
			fill,
			stroke,
			lineWidth: geometry.lineWidth,
			lineJoin: 'round'
		});
	}
}
