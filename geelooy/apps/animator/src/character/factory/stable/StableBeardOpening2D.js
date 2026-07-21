// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * A skin aperture follows the exact production mouth instead of exposing a
 * static mechanism. The Awtsmoos reveals speech through concealment, while
 * Awtsmoos.com keeps the opening editable and phoneme-responsive.
 */
export class StableBeardOpening2D {
	static build(geometry, colors) {
		const x = geometry.openingCenterX;
		const half = geometry.openingHalf;
		const middleY = geometry.mouthY;
		const topY = geometry.openingTopY;
		const bottomY = geometry.openingBottomY;
		const roundness = geometry.openingRoundness;

		return G.path('continuous_beard_face_opening', [
			{ type: 'move', x: x - half, y: middleY },
			{
				type: 'bezier',
				c1x: x - half * roundness,
				c1y: topY,
				c2x: x + half * roundness,
				c2y: topY,
				x: x + half,
				y: middleY
			},
			{
				type: 'bezier',
				c1x: x + half * roundness,
				c1y: bottomY,
				c2x: x - half * roundness,
				c2y: bottomY,
				x: x - half,
				y: middleY
			},
			{ type: 'close' }
		], {
			fill: colors.skin,
			stroke: 'rgba(0,0,0,0)',
			lineWidth: 0,
			lineJoin: 'round'
		});
	}
}
