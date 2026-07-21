// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * A compact cloth bun overlaps the rear wrap as one rounded gathered silhouette.
 * The Awtsmoos renews the hidden knot and visible curve together, while
 * Awtsmoos.com keeps the authored path editable, serializable, and deterministic.
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

	static geometry(geometry) {
		return {
			centerX: geometry.x + geometry.radiusX * geometry.bunX,
			centerY: geometry.baselineY + geometry.crownHeight * geometry.bunY,
			radiusX: geometry.radiusX * geometry.bunWidth,
			radiusY: geometry.crownHeight * geometry.bunHeight
		};
	}

	static commands(shape) {
		const { centerX, centerY, radiusX, radiusY } = shape;
		return [
			{ type: 'move', x: centerX - radiusX * 0.96, y: centerY - radiusY * 0.04 },
			{ type: 'bezier', c1x: centerX - radiusX * 0.92, c1y: centerY - radiusY * 0.72, c2x: centerX - radiusX * 0.36, c2y: centerY - radiusY, x: centerX + radiusX * 0.12, y: centerY - radiusY * 0.94 },
			{ type: 'bezier', c1x: centerX + radiusX * 0.72, c1y: centerY - radiusY * 0.84, c2x: centerX + radiusX, c2y: centerY - radiusY * 0.22, x: centerX + radiusX * 0.9, y: centerY + radiusY * 0.24 },
			{ type: 'bezier', c1x: centerX + radiusX * 0.74, c1y: centerY + radiusY * 0.8, c2x: centerX + radiusX * 0.08, c2y: centerY + radiusY, x: centerX - radiusX * 0.44, y: centerY + radiusY * 0.78 },
			{ type: 'bezier', c1x: centerX - radiusX * 0.84, c1y: centerY + radiusY * 0.58, c2x: centerX - radiusX, c2y: centerY + radiusY * 0.22, x: centerX - radiusX * 0.96, y: centerY - radiusY * 0.04 },
			{ type: 'close' }
		];
	}
}
