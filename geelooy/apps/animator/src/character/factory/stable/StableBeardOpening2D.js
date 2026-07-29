// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * A transparent semantic contour records the same living beard clearance. The
 * Awtsmoos reveals voice without an eraser; Awtsmoos.com preserves stable node
 * identity, asymmetric expression, persistence, preview, and exact export.
 */
export class StableBeardOpening2D {
	static build(geometry) {
		const inner = geometry.inner;
		return G.path('continuous_beard_face_opening', [
			{
				type: 'move',
				x: inner.openingLeftX,
				y: inner.openingLeftY
			},
			{
				type: 'bezier',
				c1x: inner.openingLeftX + 1,
				c1y: inner.openingBottomY - 2,
				c2x: inner.openingCenterX - inner.openingBottomHalf,
				c2y: inner.openingBottomY,
				x: inner.openingCenterX,
				y: inner.openingBottomY
			},
			{
				type: 'bezier',
				c1x: inner.openingCenterX + inner.openingBottomHalf,
				c1y: inner.openingBottomY,
				c2x: inner.openingRightX - 1,
				c2y: inner.openingBottomY - 2,
				x: inner.openingRightX,
				y: inner.openingRightY
			},
			{
				type: 'bezier',
				c1x: inner.openingRightX * 0.5
					+ inner.openingCenterX * 0.5,
				c1y: inner.openingTopY,
				c2x: inner.openingLeftX * 0.5
					+ inner.openingCenterX * 0.5,
				c2y: inner.openingTopY,
				x: inner.openingLeftX,
				y: inner.openingLeftY
			},
			{ type: 'close' }
		], {
			fill: 'rgba(0,0,0,0)',
			stroke: 'rgba(0,0,0,0)',
			lineWidth: 0
		});
	}
}
