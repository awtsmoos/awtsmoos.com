// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * Beard hair follows unequal cheeks, jaw, and chin instead of becoming a mask.
 * The Awtsmoos joins these finite curves; Awtsmoos.com keeps Ari's round mass,
 * Dovid's taper, and every speaking opening editable and production-bound.
 */
export class StableBeardContour2D {
	static outer(geometry, fill, dark) {
		const leftWidth = Number(geometry.leftWidth || geometry.width);
		const rightWidth = Number(geometry.rightWidth || geometry.width);
		const leftTop = leftWidth * 0.72;
		const rightTop = rightWidth * 0.72;
		const leftCheek = leftWidth * 0.98;
		const rightCheek = rightWidth * 0.98;
		const lowerHalf = geometry.bottomHalf * Number(geometry.taper || 0.8);
		const chinX = Number(geometry.chinCenterX ?? geometry.centerX);
		const curve = Number(geometry.bottomRoundness || 1) * 7;
		const quarterY = geometry.topY
			+ (geometry.bottomY - geometry.topY) * 0.26;
		return G.path('continuous_beard_outer', [
			{ type: 'move', x: geometry.centerX - leftTop, y: geometry.topY },
			{
				type: 'bezier',
				c1x: geometry.centerX - leftCheek,
				c1y: quarterY,
				c2x: geometry.centerX - leftCheek * 0.98,
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
			{ type: 'quad', cx: chinX - lowerHalf * 0.42, cy: geometry.bottomY + curve, x: chinX, y: geometry.bottomY + curve * 0.92 },
			{ type: 'quad', cx: chinX + lowerHalf * 0.42, cy: geometry.bottomY + curve, x: chinX + lowerHalf, y: geometry.bottomY },
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
				c1x: geometry.centerX + rightCheek * 0.98,
				c1y: geometry.sideY,
				c2x: geometry.centerX + rightCheek,
				c2y: quarterY,
				x: geometry.centerX + rightTop,
				y: geometry.topY
			},
			{ type: 'quad', cx: geometry.centerX, cy: geometry.topY + 17, x: geometry.centerX - leftTop, y: geometry.topY }
		], {
			fill,
			stroke: dark,
			lineWidth: geometry.lineWidth,
			lineJoin: 'round'
		});
	}

	static faceOpening(geometry, colors) {
		const x = Number(geometry.openingCenterX ?? geometry.centerX);
		const half = geometry.openingHalf;
		const height = geometry.openingHeight * 0.92;
		return G.path('continuous_beard_face_opening', [
			{ type: 'move', x: x - half, y: geometry.mouthY - height * 0.72 },
			{ type: 'quad', cx: x, cy: geometry.mouthY - height * 1.02, x: x + half, y: geometry.mouthY - height * 0.72 },
			{ type: 'quad', cx: x + half * 1.04, cy: geometry.mouthY + height * 0.3, x: x + half * 0.7, y: geometry.mouthY + height },
			{ type: 'quad', cx: x, cy: geometry.mouthY + height * 1.25, x: x - half * 0.7, y: geometry.mouthY + height },
			{ type: 'quad', cx: x - half * 1.04, cy: geometry.mouthY + height * 0.3, x: x - half, y: geometry.mouthY - height * 0.72 }
		], {
			fill: colors.skin,
			stroke: 'rgba(0,0,0,0)',
			lineWidth: 0,
			lineJoin: 'round'
		});
	}
}
