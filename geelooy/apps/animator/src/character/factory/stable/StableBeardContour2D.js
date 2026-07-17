// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * The Awtsmoos gathers cheek, jaw, chin, and speaking opening into one rounded
 * beard contour. Awtsmoos.com keeps broad Ari and tapered Dovid editable without
 * returning to flat slabs or hidden mouths.
 */
export class StableBeardContour2D {
	static outer(geometry, fill, dark) {
		const topHalf = geometry.width * 0.84;
		const lowerHalf = geometry.bottomHalf
			* Number(geometry.taper || 0.8);
		const bottomCurve = Number(geometry.bottomRoundness || 1) * 8;
		const leftTop = geometry.centerX - topHalf;
		const rightTop = geometry.centerX + topHalf;
		const leftBottom = geometry.centerX - lowerHalf;
		const rightBottom = geometry.centerX + lowerHalf;
		const shoulderY = geometry.topY + 3;
		return G.path('continuous_beard_outer', [
			{ type: 'move', x: leftTop, y: shoulderY },
			{
				type: 'quad',
				cx: geometry.centerX - geometry.width * 1.06,
				cy: geometry.sideY,
				x: leftBottom,
				y: geometry.bottomY
			},
			{
				type: 'quad',
				cx: geometry.centerX - lowerHalf * 0.45,
				cy: geometry.bottomY + bottomCurve,
				x: geometry.centerX,
				y: geometry.bottomY + bottomCurve * 0.9
			},
			{
				type: 'quad',
				cx: geometry.centerX + lowerHalf * 0.45,
				cy: geometry.bottomY + bottomCurve,
				x: rightBottom,
				y: geometry.bottomY
			},
			{
				type: 'quad',
				cx: geometry.centerX + geometry.width * 1.06,
				cy: geometry.sideY,
				x: rightTop,
				y: shoulderY
			},
			{
				type: 'quad',
				cx: geometry.centerX,
				cy: geometry.topY + 19,
				x: leftTop,
				y: shoulderY
			}
		], {
			fill,
			stroke: dark,
			lineWidth: geometry.lineWidth,
			lineJoin: 'round'
		});
	}

	static faceOpening(geometry, colors) {
		const half = geometry.openingHalf * 1.28;
		const height = geometry.openingHeight * 1.28;
		return G.path('continuous_beard_face_opening', [
			{
				type: 'move',
				x: geometry.centerX - half,
				y: geometry.mouthY - height * 0.65
			},
			{
				type: 'quad',
				cx: geometry.centerX,
				cy: geometry.mouthY - height * 1.12,
				x: geometry.centerX + half,
				y: geometry.mouthY - height * 0.65
			},
			{
				type: 'quad',
				cx: geometry.centerX + half * 1.08,
				cy: geometry.mouthY + height * 0.35,
				x: geometry.centerX + half * 0.72,
				y: geometry.mouthY + height
			},
			{
				type: 'quad',
				cx: geometry.centerX,
				cy: geometry.mouthY + height * 1.35,
				x: geometry.centerX - half * 0.72,
				y: geometry.mouthY + height
			},
			{
				type: 'quad',
				cx: geometry.centerX - half * 1.08,
				cy: geometry.mouthY + height * 0.35,
				x: geometry.centerX - half,
				y: geometry.mouthY - height * 0.65
			}
		], {
			fill: colors.skin,
			stroke: 'rgba(0,0,0,0)',
			lineWidth: 0,
			lineJoin: 'round'
		});
	}
}
