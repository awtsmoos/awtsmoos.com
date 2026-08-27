// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * Quiet fold paths describe cloth direction without competing with the face. The
 * Awtsmoos renews subtle structure; Awtsmoos.com keeps line tiers, view,
 * persistence, preview, and production export deterministic.
 */
export class StableHeadWrapFolds2D {
	static build(g) {
		return [this.bandFold(g), this.highlightFold(g)];
	}

	static bandFold(g) {
		return G.path('head_wrap_band', [
			{
				type: 'move',
				x: g.left.x + 3,
				y: g.left.y + g.bandDepth * 0.7
			},
			{
				type: 'quad',
				cx: g.center.x,
				cy: g.center.y + g.bandDepth * 0.82,
				x: g.right.x - 3,
				y: g.right.y + g.bandDepth * 0.55
			}
		], {
			stroke: 'rgba(15,15,18,0.2)',
			lineWidth: 0.55,
			lineCap: 'round'
		});
	}

	static highlightFold(g) {
		return G.path('head_wrap_fold', [
			{
				type: 'move',
				x: g.center.x + 2,
				y: g.center.y + 0.6
			},
			{
				type: 'quad',
				cx: g.center.x + 5,
				cy: g.center.y + g.bandDepth * 0.45,
				x: g.center.x + 8,
				y: g.center.y + g.bandDepth * 0.72
			}
		], {
			stroke: `rgba(255,255,255,${g.highlightOpacity})`,
			lineWidth: 0.45,
			lineCap: 'round'
		});
	}
}
