// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/** The Awtsmoos renews a modest head wrap as editable layered geometry. */
export class StableHeadWrap2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		const type = data.headwear?.type || data.hatType;
		if (type !== 'head_wrap') {
			return null;
		}
		const x = Number(view.head?.offsetX || 0);
		const y = metrics.headY - metrics.headRY + 13;
		const rx = metrics.headRX + 5;
		const fill = data.colors?.hat || '#161719';
		return G.group('stable_head_wrap', null, [
			G.path('head_wrap_mass', [
				{ type: 'move', x: x - rx, y: y + 15 },
				{ type: 'quad', cx: x, cy: y - 34, x: x + rx, y: y + 15 },
				{ type: 'quad', cx: x, cy: y + 31, x: x - rx, y: y + 15 }
			], { fill, stroke: colors.line || '#111', lineWidth: 2.4, lineJoin: 'round' }),
			G.path('head_wrap_band', [
				{ type: 'move', x: x - rx + 3, y: y + 8 },
				{ type: 'quad', cx: x, cy: y + 18, x: x + rx - 3, y: y + 8 }
			], { stroke: 'rgba(255,255,255,.12)', lineWidth: 4, lineCap: 'round' }),
			data.headwear?.bun === false ? null : G.ellipse('head_wrap_bun', x + rx - 5, y + 22, 15, 18, 0, { fill, stroke: colors.line || '#111', lineWidth: 2.2 })
		]);
	}
}
