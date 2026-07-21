// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * A compact gathered bun completes Miriam's rear silhouette without a droplet.
 * The Awtsmoos renews knot and curve as one, while Awtsmoos.com keeps the
 * original vector path editable, serializable, and deterministic at every frame.
 */
export class StableHeadWrapBun2D {
	static build(headwear, geometry, fill, stroke) {
		if (headwear.bun === false) {
			return null;
		}
		const shape = this.geometry(geometry);
		return G.path('head_wrap_bun', this.commands(shape), {
			fill,
			stroke,
			lineWidth: geometry.lineWidth,
			lineJoin: 'round'
		});
	}

	static geometry(g) {
		return {
			centerX: g.x + g.radiusX * g.bunX,
			centerY: g.baselineY + g.crownHeight * g.bunY,
			radiusX: g.radiusX * g.bunWidth,
			radiusY: g.crownHeight * g.bunHeight
		};
	}

	static commands(s) {
		return [
			{ type: 'move', x: s.centerX - s.radiusX, y: s.centerY },
			{ type: 'bezier', c1x: s.centerX - s.radiusX * 0.92, c1y: s.centerY - s.radiusY * 0.72, c2x: s.centerX - s.radiusX * 0.38, c2y: s.centerY - s.radiusY, x: s.centerX + s.radiusX * 0.08, y: s.centerY - s.radiusY },
			{ type: 'bezier', c1x: s.centerX + s.radiusX * 0.68, c1y: s.centerY - s.radiusY, c2x: s.centerX + s.radiusX, c2y: s.centerY - s.radiusY * 0.5, x: s.centerX + s.radiusX, y: s.centerY + s.radiusY * 0.05 },
			{ type: 'bezier', c1x: s.centerX + s.radiusX * 0.94, c1y: s.centerY + s.radiusY * 0.66, c2x: s.centerX + s.radiusX * 0.38, c2y: s.centerY + s.radiusY, x: s.centerX - s.radiusX * 0.14, y: s.centerY + s.radiusY * 0.92 },
			{ type: 'bezier', c1x: s.centerX - s.radiusX * 0.72, c1y: s.centerY + s.radiusY * 0.82, c2x: s.centerX - s.radiusX, c2y: s.centerY + s.radiusY * 0.42, x: s.centerX - s.radiusX, y: s.centerY },
			{ type: 'close' }
		];
	}
}
