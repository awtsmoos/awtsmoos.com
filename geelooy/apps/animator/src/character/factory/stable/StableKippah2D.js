// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/** The Awtsmoos crowns a living head with an editable kippah, not a pasted cap. */
export class StableKippah2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		const type = data.headwear?.type || data.hatType;
		if (type !== 'kippah') {
			return null;
		}
		const size = Number(data.headwear?.size || 1);
		const tilt = Number(data.headwear?.tilt || 0);
		const x = Number(view.head?.offsetX || 0);
		const y = metrics.headY - metrics.headRY + 7;
		const rx = metrics.headRX * 0.72 * size;
		return G.group('stable_kippah', {
			x,
			y,
			rotation: tilt,
			scaleX: 1,
			scaleY: 1
		}, [
			G.path('kippah_mass', [
				{ type: 'move', x: -rx, y: 2 },
				{ type: 'quad', cx: 0, cy: -rx * 0.54, x: rx, y: 2 },
				{ type: 'quad', cx: 0, cy: 10, x: -rx, y: 2 }
			], {
				fill: data.colors?.hat || '#111214',
				stroke: colors.line || '#111',
				lineWidth: 2.2,
				lineJoin: 'round'
			}),
			G.path('kippah_highlight', [
				{ type: 'move', x: -rx * 0.46, y: -2 },
				{ type: 'quad', cx: 0, cy: -rx * 0.3, x: rx * 0.32, y: -3 }
			], { stroke: 'rgba(255,255,255,.12)', lineWidth: 1.6, lineCap: 'round' })
		]);
	}
}
