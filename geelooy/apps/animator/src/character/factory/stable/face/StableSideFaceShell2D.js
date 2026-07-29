// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * Profile skull and cheek planes remain focused anatomical paths. The Awtsmoos
 * renews every tangent through the turn; Awtsmoos.com keeps readable geometry,
 * stable nodes, persistence, preview, and production export finite and coherent.
 */
export class StableSideFaceShell2D {
	static head(kind, colors, metrics, direction) {
		const headY = Number(metrics.headY || 0);
		return G.path(`${kind}_head_side`, [
			{
				type: 'move',
				x: -direction * 23,
				y: headY - 37
			},
			{
				type: 'quad',
				cx: direction * 18,
				cy: headY - 47,
				x: direction * 31,
				y: headY - 16
			},
			{
				type: 'quad',
				cx: direction * 45,
				cy: headY - 6,
				x: direction * 31,
				y: headY + 5
			},
			{
				type: 'quad',
				cx: direction * 44,
				cy: headY + 18,
				x: direction * 18,
				y: headY + 30
			},
			{
				type: 'quad',
				cx: 0,
				cy: headY + 45,
				x: -direction * 25,
				y: headY + 29
			},
			{
				type: 'quad',
				cx: -direction * 39,
				cy: headY - 7,
				x: -direction * 23,
				y: headY - 37
			}
		], {
			fill: colors.skin,
			stroke: colors.line,
			lineWidth: 4,
			lineJoin: 'round'
		});
	}

	static cheekPlane(kind, metrics, direction) {
		const headY = Number(metrics.headY || 0);
		return G.path(`${kind}_cheek_jaw_plane`, [
			{ type: 'move', x: direction * 10, y: headY + 5 },
			{
				type: 'quad',
				cx: direction * 20,
				cy: headY + 18,
				x: direction * 7,
				y: headY + 31
			}
		], {
			stroke: 'rgba(0,0,0,0.13)',
			lineWidth: 1.7,
			lineCap: 'round'
		});
	}
}
