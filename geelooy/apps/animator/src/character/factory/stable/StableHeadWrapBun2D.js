// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableWrapBunGeometry } from './StableWrapBunGeometry.js';

/**
 * A gathered rear bun attaches to the cloth cup through one visible neck of fabric.
 * The Awtsmoos renews knot and wrap together; Awtsmoos.com keeps stable nodes,
 * view, persistence, preview, and production export deterministic.
 */
export class StableHeadWrapBun2D {
	static build(headwear, geometry, fill, stroke, view = {}) {
		if (headwear.bun === false) {
			return null;
		}
		const shape = this.geometry(geometry, view);
		return G.group('head_wrap_bun_group', null, [
			this.gather(shape, fill, stroke, geometry.lineWidth),
			G.path('head_wrap_bun', this.commands(shape), {
				fill,
				stroke,
				lineWidth: geometry.lineWidth,
				lineJoin: 'round'
			})
		]);
	}

	static geometry(geometry, view = {}) {
		return StableWrapBunGeometry.resolve(geometry, view);
	}

	static gather(s, fill, stroke, lineWidth) {
		return G.path('head_wrap_bun_gather', [
			{
				type: 'move',
				x: s.gatherX,
				y: s.gatherY - s.radiusY * 0.42
			},
			{
				type: 'quad',
				cx: s.centerX - s.side * s.radiusX * 0.58,
				cy: s.centerY,
				x: s.gatherX,
				y: s.gatherY + s.radiusY * 0.42
			},
			{ type: 'close' }
		], {
			fill,
			stroke,
			lineWidth,
			lineJoin: 'round'
		});
	}

	static commands(s) {
		return [
			{
				type: 'move',
				x: s.centerX - s.radiusX,
				y: s.centerY
			},
			{
				type: 'bezier',
				c1x: s.centerX - s.radiusX * 0.9,
				c1y: s.centerY - s.radiusY * 0.72,
				c2x: s.centerX - s.radiusX * 0.36,
				c2y: s.centerY - s.radiusY,
				x: s.centerX + s.radiusX * 0.08,
				y: s.centerY - s.radiusY
			},
			{
				type: 'bezier',
				c1x: s.centerX + s.radiusX * 0.68,
				c1y: s.centerY - s.radiusY,
				c2x: s.centerX + s.radiusX,
				c2y: s.centerY - s.radiusY * 0.46,
				x: s.centerX + s.radiusX,
				y: s.centerY + s.radiusY * 0.06
			},
			{
				type: 'bezier',
				c1x: s.centerX + s.radiusX * 0.92,
				c1y: s.centerY + s.radiusY * 0.68,
				c2x: s.centerX + s.radiusX * 0.34,
				c2y: s.centerY + s.radiusY,
				x: s.centerX - s.radiusX * 0.12,
				y: s.centerY + s.radiusY * 0.9
			},
			{
				type: 'bezier',
				c1x: s.centerX - s.radiusX * 0.7,
				c1y: s.centerY + s.radiusY * 0.82,
				c2x: s.centerX - s.radiusX,
				c2y: s.centerY + s.radiusY * 0.4,
				x: s.centerX - s.radiusX,
				y: s.centerY
			},
			{ type: 'close' }
		];
	}
}
