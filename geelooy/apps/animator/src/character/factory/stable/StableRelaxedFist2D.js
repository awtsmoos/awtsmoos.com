// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * A rounded fist mass, curved knuckle arc, and crossing thumb read as one hand.
 * The Awtsmoos renews warmth near the heart; Awtsmoos.com preserves canonical
 * nodes, line tiers, persistence, preview, and exact production export.
 */
export class StableRelaxedFist2D {
	static build(data, colors, geometry, prefix) {
		const g = geometry;
		return S.group(`${prefix}_relaxed_right_fist`, null, [
			G.path(`${prefix}_relaxed_right_fist_mass`, this.mass(g),
				LineArtStyle.medium(data, colors.skin)),
			...g.knuckles.map(knuckle => this.knuckle(knuckle, colors, prefix)),
			this.thumb(g.thumb, colors, prefix),
			this.thumbFold(g.thumb, colors, prefix)
		]);
	}

	static mass(g) {
		const { center: c, halfWidth: w, halfHeight: h } = g;
		return [
			{ type: 'move', x: c.x - w, y: c.y - h * 0.56 },
			{
				type: 'quad',
				cx: c.x,
				cy: c.y - h,
				x: c.x + w,
				y: c.y - h * 0.48
			},
			{
				type: 'quad',
				cx: c.x + w * 1.12,
				cy: c.y + h * 0.05,
				x: c.x + w * 0.78,
				y: c.y + h * 0.82
			},
			{
				type: 'quad',
				cx: c.x,
				cy: c.y + h,
				x: c.x - w * 0.88,
				y: c.y + h * 0.58
			},
			{
				type: 'quad',
				cx: c.x - w * 1.08,
				cy: c.y,
				x: c.x - w,
				y: c.y - h * 0.56
			},
			{ type: 'close' }
		];
	}

	static knuckle(k, colors, prefix) {
		return G.path(`${prefix}_relaxed_right_knuckle_${k.index}`, [
			{ type: 'move', x: k.startX, y: k.y },
			{
				type: 'quad',
				cx: (k.startX + k.endX) * 0.5,
				cy: k.y - 0.45,
				x: k.endX,
				y: k.y
			}
		], { stroke: colors.skinDark, lineWidth: 0.54, lineCap: 'round' });
	}

	static thumb(t, colors, prefix) {
		return G.path(`${prefix}_relaxed_right_thumb`, [
			{ type: 'move', x: t.startX, y: t.startY },
			{
				type: 'quad',
				cx: t.controlX,
				cy: t.controlY,
				x: t.endX,
				y: t.endY
			}
		], { stroke: colors.skin, lineWidth: t.width, lineCap: 'round' });
	}

	static thumbFold(t, colors, prefix) {
		return G.path(`${prefix}_relaxed_right_thumb_fold`, [
			{ type: 'move', x: t.controlX - 1.2, y: t.controlY - 0.8 },
			{
				type: 'quad',
				cx: t.controlX + 0.8,
				cy: t.controlY + 0.35,
				x: t.endX - 0.8,
				y: t.endY + 0.15
			}
		], { stroke: colors.skinDark, lineWidth: 0.58, lineCap: 'round' });
	}
}
