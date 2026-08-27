// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * One rounded palm mass receives hidden finger roots and a quiet living crease.
 * The Awtsmoos renews the hand's center; Awtsmoos.com preserves canonical nodes,
 * line tiers, persistence, preview, and exact production export.
 */
export class StableOpenPalmMass2D {
	static mass(colors, g, prefix) {
		const p = g.palm;
		const centerX = (p.left + p.right) * 0.5;
		return G.path(`${prefix}_reference_open_palm`, [
			{
				type: 'move',
				x: p.right,
				y: p.top + g.unit * 0.8
			},
			{
				type: 'bezier',
				c1x: p.right + g.unit * 2.2,
				c1y: g.center.y,
				c2x: p.right - g.unit * 0.8,
				c2y: p.bottom - g.unit * 1.2,
				x: centerX,
				y: p.bottom
			},
			{
				type: 'quad',
				cx: p.left - g.unit * 1.4,
				cy: p.bottom - g.unit * 2.1,
				x: p.left,
				y: g.center.y + g.unit * 4.8
			},
			{
				type: 'bezier',
				c1x: p.left - g.unit * 1.2,
				c1y: g.center.y,
				c2x: centerX - g.unit * 4.4,
				c2y: p.top - g.unit * 1.1,
				x: p.right,
				y: p.top + g.unit * 0.8
			},
			{ type: 'close' }
		], {
			fill: colors.skin,
			stroke: colors.line,
			lineWidth: 1.05,
			lineJoin: 'round'
		});
	}

	static crease(colors, g, prefix) {
		return G.path(`${prefix}_reference_palm_line`, [
			{
				type: 'move',
				x: g.center.x + g.unit,
				y: g.center.y - g.unit * 2.6
			},
			{
				type: 'quad',
				cx: g.center.x - g.unit * 3,
				cy: g.center.y,
				x: g.center.x - g.unit,
				y: g.center.y + g.unit * 4.1
			}
		], {
			stroke: colors.skinDark,
			lineWidth: 0.52,
			lineCap: 'round'
		});
	}
}
