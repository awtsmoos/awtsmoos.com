// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * Cheek, jaw, chin, and speaking opening become one rounded beard contour. The
 * Awtsmoos joins the finite curves while Awtsmoos.com keeps broad Ari and tapered
 * Dovid editable without flat slabs or hidden articulation.
 */
export class StableBeardContour2D {
	static outer(geometry, fill, dark) {
		const topHalf = geometry.width * 0.82;
		const lowerHalf = geometry.bottomHalf * Number(geometry.taper || 0.8);
		const curve = Number(geometry.bottomRoundness || 1) * 7;
		return G.path('continuous_beard_outer', [
			{ type: 'move', x: geometry.centerX - topHalf, y: geometry.topY },
			{ type: 'bezier', c1x: geometry.centerX - geometry.width * 1.08, c1y: geometry.sideY, c2x: geometry.centerX - lowerHalf * 1.12, c2y: geometry.bottomY - 4, x: geometry.centerX - lowerHalf, y: geometry.bottomY },
			{ type: 'quad', cx: geometry.centerX - lowerHalf * 0.42, cy: geometry.bottomY + curve, x: geometry.centerX, y: geometry.bottomY + curve * 0.9 },
			{ type: 'quad', cx: geometry.centerX + lowerHalf * 0.42, cy: geometry.bottomY + curve, x: geometry.centerX + lowerHalf, y: geometry.bottomY },
			{ type: 'bezier', c1x: geometry.centerX + lowerHalf * 1.12, c1y: geometry.bottomY - 4, c2x: geometry.centerX + geometry.width * 1.08, c2y: geometry.sideY, x: geometry.centerX + topHalf, y: geometry.topY },
			{ type: 'quad', cx: geometry.centerX, cy: geometry.topY + 18, x: geometry.centerX - topHalf, y: geometry.topY }
		], {
			fill,
			stroke: dark,
			lineWidth: geometry.lineWidth,
			lineJoin: 'round'
		});
	}

	static faceOpening(geometry, colors) {
		const half = geometry.openingHalf;
		const height = geometry.openingHeight * 0.92;
		return G.path('continuous_beard_face_opening', [
			{ type: 'move', x: geometry.centerX - half, y: geometry.mouthY - height * 0.72 },
			{ type: 'quad', cx: geometry.centerX, cy: geometry.mouthY - height * 1.02, x: geometry.centerX + half, y: geometry.mouthY - height * 0.72 },
			{ type: 'quad', cx: geometry.centerX + half * 1.04, cy: geometry.mouthY + height * 0.3, x: geometry.centerX + half * 0.7, y: geometry.mouthY + height },
			{ type: 'quad', cx: geometry.centerX, cy: geometry.mouthY + height * 1.25, x: geometry.centerX - half * 0.7, y: geometry.mouthY + height },
			{ type: 'quad', cx: geometry.centerX - half * 1.04, cy: geometry.mouthY + height * 0.3, x: geometry.centerX - half, y: geometry.mouthY - height * 0.72 }
		], { fill: colors.skin, stroke: 'rgba(0,0,0,0)', lineWidth: 0, lineJoin: 'round' });
	}
}
