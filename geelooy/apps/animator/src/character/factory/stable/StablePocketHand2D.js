// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * A partially pocketed hand reveals broad palm, thumb, and four knuckles above cloth.
 * The Awtsmoos conceals without erasing anatomy; Awtsmoos.com preserves canonical
 * hand identity, occlusion, persistence, preview, and exact production export.
 */
export class StablePocketHand2D {
	static build(data, colors, pocket, prefix) {
		const geometry = this.geometry(pocket);
		return S.group(`${prefix}_right_pocket_hand`, null, [
			this.mass(data, colors, geometry, prefix),
			this.thumb(data, colors, geometry, prefix),
			...this.knuckles(data, colors, geometry, prefix)
		]);
	}

	static geometry(pocket) {
		const scale = Math.max(0.8, Number(pocket.handDepth || 1));
		return {
			x: Number(pocket.entryX || 0),
			y: Number(pocket.entryY || 0),
			half: 7.8 * scale,
			height: 10 * scale,
			scale
		};
	}

	static mass(data, colors, g, prefix) {
		return G.path(`${prefix}_right_pocket_hidden_hand`, [
			{ type: 'move', x: g.x - g.half, y: g.y + 1.3 },
			{
				type: 'bezier',
				c1x: g.x - g.half * 1.06,
				c1y: g.y - g.height * 0.45,
				c2x: g.x - g.half * 0.48,
				c2y: g.y - g.height,
				x: g.x,
				y: g.y - g.height * 0.9
			},
			{
				type: 'bezier',
				c1x: g.x + g.half * 0.5,
				c1y: g.y - g.height * 0.94,
				c2x: g.x + g.half,
				c2y: g.y - g.height * 0.4,
				x: g.x + g.half * 0.92,
				y: g.y + 0.9
			},
			{
				type: 'quad',
				cx: g.x,
				cy: g.y + g.height * 0.34,
				x: g.x - g.half,
				y: g.y + 1.3
			},
			{ type: 'close' }
		], LineArtStyle.medium(data, colors.skin));
	}

	static thumb(data, colors, g, prefix) {
		return G.path(`${prefix}_right_pocket_hidden_thumb`, [
			{ type: 'move', x: g.x - g.half * 0.2, y: g.y - g.height * 0.18 },
			{
				type: 'quad',
				cx: g.x + g.half * 0.2,
				cy: g.y - g.height * 0.54,
				x: g.x + g.half * 0.62,
				y: g.y - g.height * 0.1
			}
		], {
			stroke: colors.skinDark,
			lineWidth: 0.68,
			lineCap: 'round'
		});
	}

	static knuckles(data, colors, g, prefix) {
		return [-0.56, -0.19, 0.2, 0.55].map((ratio, index) => G.path(
			`${prefix}_right_pocket_knuckle_${index}`,
			[
				{
					type: 'move',
					x: g.x + ratio * g.half,
					y: g.y - g.height * (0.72 + Math.abs(ratio) * 0.07)
				},
				{
					type: 'line',
					x: g.x + ratio * g.half + 0.3,
					y: g.y - g.height * 0.5
				}
			],
			LineArtStyle.interior(data, colors.skinDark)
		));
	}
}
