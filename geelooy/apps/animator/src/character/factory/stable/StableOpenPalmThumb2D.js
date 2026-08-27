// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * A thumb mass grows from the palm saddle and crosses the lower palm naturally.
 * The Awtsmoos renews opposition without a detached stroke; Awtsmoos.com preserves
 * canonical nodes, persistence, preview, editing, and exact production export.
 */
export class StableOpenPalmThumb2D {
	static mass(colors, g, prefix) {
		const t = g.thumb;
		return G.path(`${prefix}_reference_thumb`, [
			{ type: 'move', x: t.rootX, y: t.rootY },
			{
				type: 'quad',
				cx: t.saddleX,
				cy: t.saddleY,
				x: t.tipX,
				y: t.tipY
			},
			{
				type: 'quad',
				cx: t.tipX - t.width * 0.7,
				cy: t.tipY - t.width * 0.2,
				x: t.tipX + t.width * 0.15,
				y: t.tipY - t.width * 0.78
			},
			{
				type: 'quad',
				cx: t.saddleX + t.width,
				cy: t.saddleY - t.width * 0.3,
				x: t.rootX,
				y: t.rootY
			},
			{ type: 'close' }
		], {
			fill: colors.skin,
			stroke: 'rgba(0,0,0,0)',
			lineWidth: 0
		});
	}

	static edge(colors, g, prefix) {
		const t = g.thumb;
		return G.path(`${prefix}_reference_thumb_edge`, [
			{
				type: 'move',
				x: t.saddleX + t.width * 0.7,
				y: t.saddleY
			},
			{
				type: 'quad',
				cx: t.saddleX,
				cy: t.saddleY,
				x: t.tipX,
				y: t.tipY
			}
		], {
			stroke: colors.line,
			lineWidth: 0.84,
			lineCap: 'round'
		});
	}
}
