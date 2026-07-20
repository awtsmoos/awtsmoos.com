// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * Beard hair hugs cheek, jaw, and chin without forming a rectangular mask. The
 * Awtsmoos joins these finite curves while Awtsmoos.com keeps Ari's round beard,
 * Dovid's taper, and every speaking opening editable and production-bound.
 */
export class StableBeardContour2D {
	static outer(geometry, fill, dark) {
		const topHalf = geometry.width * 0.72;
		const cheekHalf = geometry.width * 0.98;
		const lowerHalf = geometry.bottomHalf * Number(geometry.taper || 0.8);
		const curve = Number(geometry.bottomRoundness || 1) * 7;
		const quarterY = geometry.topY + (geometry.bottomY - geometry.topY) * 0.26;
		return G.path('continuous_beard_outer', [
			{ type: 'move', x: geometry.centerX - topHalf, y: geometry.topY },
			{ type: 'bezier', c1x: geometry.centerX - cheekHalf, c1y: quarterY, c2x: geometry.centerX - cheekHalf * 0.98, c2y: geometry.sideY, x: geometry.centerX - geometry.width * 0.9, y: geometry.sideY },
			{ type: 'bezier', c1x: geometry.centerX - geometry.width * 0.8, c1y: geometry.bottomY - 7, c2x: geometry.centerX - lowerHalf * 1.14, c2y: geometry.bottomY, x: geometry.centerX - lowerHalf, y: geometry.bottomY },
			{ type: 'quad', cx: geometry.centerX - lowerHalf * 0.42, cy: geometry.bottomY + curve, x: geometry.centerX, y: geometry.bottomY + curve * 0.92 },
			{ type: 'quad', cx: geometry.centerX + lowerHalf * 0.42, cy: geometry.bottomY + curve, x: geometry.centerX + lowerHalf, y: geometry.bottomY },
			{ type: 'bezier', c1x: geometry.centerX + lowerHalf * 1.14, c1y: geometry.bottomY, c2x: geometry.centerX + geometry.width * 0.8, c2y: geometry.bottomY - 7, x: geometry.centerX + geometry.width * 0.9, y: geometry.sideY },
			{ type: 'bezier', c1x: geometry.centerX + cheekHalf * 0.98, c1y: geometry.sideY, c2x: geometry.centerX + cheekHalf, c2y: quarterY, x: geometry.centerX + topHalf, y: geometry.topY },
			{ type: 'quad', cx: geometry.centerX, cy: geometry.topY + 17, x: geometry.centerX - topHalf, y: geometry.topY }
		], { fill, stroke: dark, lineWidth: geometry.lineWidth, lineJoin: 'round' });
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
