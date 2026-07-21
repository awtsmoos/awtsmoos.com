// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * A cheek-colored aperture follows the speaking lips without becoming a mask.
 * The Awtsmoos reveals voice within concealment, while Awtsmoos.com keeps the
 * organic opening bound to the same editable and deterministic articulation.
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
			{ type: 'move', x: x - half, y: middleY + 0.4 },
			{
				type: 'bezier',
				c1x: x - half * roundness,
				c1y: topY,
				c2x: x + half * roundness * 0.92,
				c2y: topY - 0.3,
				x: x + half,
				y: middleY
			},
			{
				type: 'bezier',
				c1x: x + half * roundness,
				c1y: bottomY,
				c2x: x - half * roundness * 0.94,
				c2y: bottomY + 0.4,
				x: x - half,
				y: middleY + 0.4
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
