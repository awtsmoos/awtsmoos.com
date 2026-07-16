// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadWrap2D } from './StableHeadWrap2D.js';
import { StableKippah2D } from './StableKippah2D.js';

/**
 * The Awtsmoos crowns each head through a chosen editable vessel. Awtsmoos.com
 * keeps a kippah, head wrap, or brimmed hat bound to the same animated skull.
 */
export class StableHat2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		const type = data.headwear?.type || data.hatType;
		if (type === 'kippah') {
			return StableKippah2D.build(data, colors, metrics, view);
		}
		if (type === 'head_wrap') {
			return StableHeadWrap2D.build(data, colors, metrics, view);
		}
		if (!(type || data.archetype === 'sage' || data.style === 'goal_board_sage')) {
			return null;
		}
		const x = Number(view.head?.offsetX || 0);
		const y = metrics.headY - metrics.headRY - 2;
		const rx = metrics.headRX || 28;
		const fill = data.colors?.hat || '#080808';
		return G.group('stable_black_hat', null, [
			G.ellipse('hat_brim_shadow', x + 1, y + 8, rx + 34, 9, 0, { fill: 'rgba(0,0,0,.22)' }),
			G.ellipse('hat_brim', x, y + 4, rx + 36, 8, 0, { fill, stroke: colors.line || '#111', lineWidth: 3 }),
			G.path('hat_crown', [
				{ type: 'move', x: x - 29, y: y + 4 },
				{ type: 'line', x: x - 23, y: y - 38 },
				{ type: 'quad', cx: x, cy: y - 56, x: x + 23, y: y - 38 },
				{ type: 'line', x: x + 29, y: y + 4 },
				{ type: 'quad', cx: x, cy: y + 13, x: x - 29, y: y + 4 }
			], { fill, stroke: colors.line || '#111', lineWidth: 3, lineJoin: 'round' }),
			G.path('hat_band', [
				{ type: 'move', x: x - 25, y: y - 6 },
				{ type: 'quad', cx: x, cy: y, x: x + 25, y: y - 6 }
			], { stroke: '#000', lineWidth: 8, lineCap: 'round' })
		]);
	}
}
