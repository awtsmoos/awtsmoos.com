// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * A restrained near-side tuck balances the dominant sweep without mirroring it.
 * The Awtsmoos renews asymmetry; Awtsmoos.com preserves stable nodes, view,
 * persistence, preview, and production export within one compact field.
 */
export class StableFringeTuck2D {
	static mass(g, fill) {
		return G.path('feminine_fringe_root', this.commands(g), { fill });
	}

	static edge(g, colors) {
		return G.path('feminine_fringe_side_edge', [
			{ type: 'move', x: g.tuckOuterX, y: g.tuckBottomY },
			{
				type: 'bezier',
				c1x: g.tuckOuterX - g.partSide * 5,
				c1y: g.tuckBottomY,
				c2x: g.tuckInnerX + g.partSide * 3,
				c2y: g.tuckInnerY + 2,
				x: g.tuckInnerX,
				y: g.tuckInnerY
			}
		], {
			stroke: colors.hairDark || '#2c1912',
			lineWidth: g.lineWidth,
			lineCap: 'round'
		});
	}

	static commands(g) {
		return [
			{ type: 'move', x: g.partX, y: g.partY },
			{
				type: 'bezier',
				c1x: g.partX + g.partSide * 3,
				c1y: g.partY,
				c2x: g.tuckOuterX - g.partSide * 2,
				c2y: g.tuckTopY,
				x: g.tuckOuterX,
				y: g.tuckTopY
			},
			{
				type: 'quad',
				cx: g.tuckOuterX + g.partSide,
				cy: (g.tuckTopY + g.tuckBottomY) * 0.5,
				x: g.tuckOuterX,
				y: g.tuckBottomY
			},
			{
				type: 'bezier',
				c1x: g.tuckOuterX - g.partSide * 5,
				c1y: g.tuckBottomY,
				c2x: g.tuckInnerX + g.partSide * 3,
				c2y: g.tuckInnerY + 2,
				x: g.tuckInnerX,
				y: g.tuckInnerY
			},
			{
				type: 'quad',
				cx: g.partX + g.partSide * 2,
				cy: g.partY + 3,
				x: g.partX,
				y: g.partY
			},
			{ type: 'close' }
		];
	}
}
