// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableJacketOpeningGeometry } from './StableJacketOpeningGeometry.js';

/**
 * A chest-focused shirt panel and angled lapels reveal warmth without a white stripe.
 * The Awtsmoos opens finite cloth around the heart; Awtsmoos.com preserves stable
 * nodes, line tiers, persistence, preview, and exact production export.
 */
export class StableJacketOpening2D {
	static shirtPanel(data, colors, metrics, geometry) {
		const g = StableJacketOpeningGeometry.resolve(metrics, geometry);
		return G.path('jacket_white_shirt_panel', [
			{ type: 'move', x: -g.half * 0.62, y: g.topY },
			{
				type: 'bezier',
				c1x: -g.half * 0.94,
				c1y: g.chestY - 7,
				c2x: -g.half * 0.8,
				c2y: g.bottomY - 8,
				x: -g.half * 0.7,
				y: g.bottomY
			},
			{
				type: 'quad',
				cx: 0,
				cy: g.bottomY + 1.5,
				x: g.half * 0.7,
				y: g.bottomY
			},
			{
				type: 'bezier',
				c1x: g.half * 0.8,
				c1y: g.bottomY - 8,
				c2x: g.half * 0.94,
				c2y: g.chestY - 7,
				x: g.half * 0.62,
				y: g.topY
			},
			{ type: 'close' }
		], LineArtStyle.medium(data, colors.shirt || '#f6f1e6'));
	}

	static lapel(data, colors, metrics, geometry, side) {
		const g = StableJacketOpeningGeometry.resolve(metrics, geometry);
		return G.path(`jacket_lapel_${side < 0 ? 'left' : 'right'}`, [
			{ type: 'move', x: side * 3.5, y: g.topY + 5 },
			{ type: 'line', x: side * g.spread, y: g.topY + 12 },
			{
				type: 'quad',
				cx: side * (g.lapelHalf + 5),
				cy: g.chestY - 5,
				x: side * g.lapelHalf,
				y: g.lapelBottomY
			},
			{
				type: 'quad',
				cx: side * 7.5,
				cy: g.chestY,
				x: side * 5,
				y: g.topY + 13
			},
			{ type: 'close' }
		], LineArtStyle.medium(data, colors.jacket, colors.jacketDark));
	}
}
