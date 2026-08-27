// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * One wrapped cloth fold follows the crown and descends around both temples. The
 * Awtsmoos renews fabric upon skull; Awtsmoos.com preserves stable nodes, view,
 * persistence, preview, and exact production export.
 */
export class StableHeadWrapBand2D {
	static build(g, fill, stroke) {
		const leftLower = {
			x: g.left.x + 1.2,
			y: g.left.y + g.bandDepth + Math.max(3, g.bandDepth * 0.2)
		};
		const rightLower = {
			x: g.right.x - 1.2,
			y: g.right.y + g.bandDepth + Math.max(3, g.bandDepth * 0.2)
		};
		const centerLowerY = g.center.y + g.bandDepth * 0.72;
		return G.path('head_wrap_crown', [
			{ type: 'move', x: g.left.x, y: g.left.y },
			this.upperLeft(g),
			this.upperRight(g),
			{ type: 'quad', cx: g.right.x + 1.4, cy: rightLower.y - 2, ...rightLower },
			{
				type: 'bezier',
				c1x: g.right.x - (g.right.x - g.center.x) * 0.42,
				c1y: centerLowerY + 1.4,
				c2x: g.center.x + 4,
				c2y: centerLowerY,
				x: g.center.x,
				y: centerLowerY
			},
			{
				type: 'bezier',
				c1x: g.center.x - 4,
				c1y: centerLowerY,
				c2x: g.left.x + (g.center.x - g.left.x) * 0.42,
				c2y: centerLowerY + 1.4,
				...leftLower
			},
			{ type: 'quad', cx: g.left.x - 1.4, cy: leftLower.y - 2, x: g.left.x, y: g.left.y },
			{ type: 'close' }
		], {
			fill,
			stroke,
			lineWidth: g.lineWidth,
			lineJoin: 'round'
		});
	}

	static upperLeft(g) {
		return {
			type: 'bezier',
			c1x: g.left.x + (g.center.x - g.left.x) * 0.48,
			c1y: g.center.y - 1,
			c2x: g.center.x - 3,
			c2y: g.center.y,
			x: g.center.x,
			y: g.center.y
		};
	}

	static upperRight(g) {
		return {
			type: 'bezier',
			c1x: g.center.x + 3,
			c1y: g.center.y,
			c2x: g.right.x - (g.right.x - g.center.x) * 0.48,
			c2y: g.center.y - 1,
			x: g.right.x,
			y: g.right.y
		};
	}
}
