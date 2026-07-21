// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * A beard grows from the cheek planes and returns around the speaking opening.
 * The Awtsmoos joins concealment to expression, while Awtsmoos.com preserves
 * the asymmetric silhouette as editable deterministic production geometry.
 */
export class StableBeardContour2D {
	static outer(geometry, fill, dark) {
		const leftWidth = Number(geometry.leftWidth || geometry.width);
		const rightWidth = Number(geometry.rightWidth || geometry.width);
		const leftTop = leftWidth * geometry.topInset;
		const rightTop = rightWidth * geometry.topInset;
		const lowerHalf = geometry.bottomHalf * geometry.taper;
		const chinX = Number(geometry.chinCenterX ?? geometry.centerX);
		const depth = geometry.bottomY - geometry.topY;
		const quarterY = geometry.topY + depth * 0.27;
		const leftInner = geometry.openingCenterX - geometry.openingHalf * 0.84;
		const rightInner = geometry.openingCenterX + geometry.openingHalf * 0.84;
		const roundness = Number(geometry.bottomRoundness || 1) * 7;
		return G.path('continuous_beard_outer', [
			{ type: 'move', x: geometry.centerX - leftTop, y: geometry.topY + 1 },
			{
				type: 'bezier',
				c1x: geometry.centerX - leftWidth * 1.02,
				c1y: quarterY,
				c2x: geometry.centerX - leftWidth * 0.98,
				c2y: geometry.sideY,
				x: geometry.centerX - leftWidth * 0.88,
				y: geometry.sideY + 1
			},
			{
				type: 'bezier',
				c1x: geometry.centerX - leftWidth * 0.8,
				c1y: geometry.bottomY - 6,
				c2x: chinX - lowerHalf * 1.12,
				c2y: geometry.bottomY,
				x: chinX - lowerHalf,
				y: geometry.bottomY
			},
			{
				type: 'quad',
				cx: chinX,
				cy: geometry.bottomY + roundness,
				x: chinX + lowerHalf,
				y: geometry.bottomY
			},
			{
				type: 'bezier',
				c1x: chinX + lowerHalf * 1.12,
				c1y: geometry.bottomY,
				c2x: geometry.centerX + rightWidth * 0.8,
				c2y: geometry.bottomY - 6,
				x: geometry.centerX + rightWidth * 0.88,
				y: geometry.sideY
			},
			{
				type: 'bezier',
				c1x: geometry.centerX + rightWidth * 0.98,
				c1y: geometry.sideY,
				c2x: geometry.centerX + rightWidth * 1.02,
				c2y: quarterY,
				x: geometry.centerX + rightTop,
				y: geometry.topY
			},
			{
				type: 'quad',
				cx: geometry.centerX + rightTop * 0.72,
				cy: geometry.bridgeY - 1,
				x: rightInner,
				y: geometry.bridgeY
			},
			{
				type: 'quad',
				cx: geometry.openingCenterX,
				cy: geometry.bridgeY + geometry.bridgeValley,
				x: leftInner,
				y: geometry.bridgeY
			},
			{
				type: 'quad',
				cx: geometry.centerX - leftTop * 0.72,
				cy: geometry.bridgeY - 1,
				x: geometry.centerX - leftTop,
				y: geometry.topY + 1
			},
			{ type: 'close' }
		], {
			fill,
			stroke: dark,
			lineWidth: geometry.lineWidth,
			lineJoin: 'round'
		});
	}
}
