// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * Beard hair follows unequal cheeks and curls inward around a living mouth. The
 * Awtsmoos joins broad mercy and guarded restraint, while Awtsmoos.com preserves
 * Ari's round mass and Dovid's taper as editable production silhouettes.
 */
export class StableBeardContour2D {
	static outer(geometry, fill, dark) {
		const leftWidth = Number(geometry.leftWidth || geometry.width);
		const rightWidth = Number(geometry.rightWidth || geometry.width);
		const leftTop = leftWidth * geometry.topInset;
		const rightTop = rightWidth * geometry.topInset;
		const lowerHalf = geometry.bottomHalf * geometry.taper;
		const chinX = Number(geometry.chinCenterX ?? geometry.centerX);
		const curve = Number(geometry.bottomRoundness || 1) * 7;
		const quarterY = geometry.topY
			+ (geometry.bottomY - geometry.topY) * 0.25;
		const rightInner = geometry.centerX
			+ geometry.openingHalf * 0.82;
		const leftInner = geometry.centerX
			- geometry.openingHalf * 0.82;

		return G.path('continuous_beard_outer', [
			{ type: 'move', x: geometry.centerX - leftTop, y: geometry.topY },
			{
				type: 'bezier',
				c1x: geometry.centerX - leftWidth,
				c1y: quarterY,
				c2x: geometry.centerX - leftWidth,
				c2y: geometry.sideY,
				x: geometry.centerX - leftWidth * 0.9,
				y: geometry.sideY
			},
			{
				type: 'bezier',
				c1x: geometry.centerX - leftWidth * 0.8,
				c1y: geometry.bottomY - 7,
				c2x: chinX - lowerHalf * 1.14,
				c2y: geometry.bottomY,
				x: chinX - lowerHalf,
				y: geometry.bottomY
			},
			{
				type: 'quad',
				cx: chinX,
				cy: geometry.bottomY + curve,
				x: chinX + lowerHalf,
				y: geometry.bottomY
			},
			{
				type: 'bezier',
				c1x: chinX + lowerHalf * 1.14,
				c1y: geometry.bottomY,
				c2x: geometry.centerX + rightWidth * 0.8,
				c2y: geometry.bottomY - 7,
				x: geometry.centerX + rightWidth * 0.9,
				y: geometry.sideY
			},
			{
				type: 'bezier',
				c1x: geometry.centerX + rightWidth,
				c1y: geometry.sideY,
				c2x: geometry.centerX + rightWidth,
				c2y: quarterY,
				x: geometry.centerX + rightTop,
				y: geometry.topY
			},
			{
				type: 'quad',
				cx: geometry.centerX + rightTop * 0.5,
				cy: geometry.topY + 2,
				x: rightInner,
				y: geometry.bridgeY
			},
			{
				type: 'quad',
				cx: geometry.centerX,
				cy: geometry.bridgeY + geometry.bridgeValley,
				x: leftInner,
				y: geometry.bridgeY
			},
			{
				type: 'quad',
				cx: geometry.centerX - leftTop * 0.5,
				cy: geometry.topY + 2,
				x: geometry.centerX - leftTop,
				y: geometry.topY
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
