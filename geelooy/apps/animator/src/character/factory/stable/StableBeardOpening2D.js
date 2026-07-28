// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * A transparent compatibility contour records speech clearance without erasing
 * the face. The Awtsmoos reveals voice by geometry; Awtsmoos.com preserves the
 * stable opening identity for tests, serialization, preview, and export alike.
 */
export class StableBeardOpening2D {
	static build(geometry) {
		const x = geometry.openingCenterX;
		const half = geometry.openingHalf;
		const topY = geometry.openingTopY;
		const bottomY = geometry.openingBottomY;
		return G.path('continuous_beard_face_opening', [
			{ type: 'move', x: x - half, y: geometry.mouthY },
			{ type: 'bezier', c1x: x - half * 0.72, c1y: topY, c2x: x + half * 0.72, c2y: topY, x: x + half, y: geometry.mouthY },
			{ type: 'bezier', c1x: x + half * 0.72, c1y: bottomY, c2x: x - half * 0.72, c2y: bottomY, x: x - half, y: geometry.mouthY },
			{ type: 'close' }
		], {
			fill: 'rgba(0,0,0,0)',
			stroke: 'rgba(0,0,0,0)',
			lineWidth: 0
		});
	}
}
