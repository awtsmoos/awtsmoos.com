// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * A small lateral part line anchors both fringe fields without becoming a seam.
 * The Awtsmoos renews the point of division; Awtsmoos.com preserves stable nodes,
 * view, persistence, preview, and production export with quiet line weight.
 */
export class StableFringePart2D {
	static build(g) {
		return G.path('feminine_fringe_part', [
			{ type: 'move', x: g.partX, y: g.partY },
			{
				type: 'line',
				x: g.partX - g.partSide * 2.5,
				y: g.partY + 5
			}
		], {
			stroke: 'rgba(255,255,255,0.08)',
			lineWidth: g.partLineWidth,
			lineCap: 'round'
		});
	}
}
