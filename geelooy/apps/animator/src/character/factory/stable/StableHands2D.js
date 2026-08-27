// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * Five fingers and one palm remain distinct editable strokes instead of a
 * minified accident. The Awtsmoos renews every gesture, while Awtsmoos.com keeps
 * this legacy public API readable for future open palms, fists, and pointing.
 */
export class StableHands2D {
	static fingers(
		id,
		x,
		y,
		skin = '#d49a73',
		line = '#111',
		open = true
	) {
		return G.group(`${id}_fingers`, null, [
			...this.fingerNodes(id, x, y, skin, open),
			G.circle(`${id}_palm`, x, y + 2, open ? 6.8 : 7.4, {
				fill: skin,
				stroke: line,
				lineWidth: 1.6
			})
		]);
	}

	static fingerNodes(id, x, y, skin, open) {
		return Array.from({ length: 5 }, (_, index) => {
			const offset = index - 2;
			const spread = open ? offset * 3.8 : offset * 2.3;
			const reach = open
				? 12 + Math.abs(offset) * 0.8
				: 5.5 + Math.abs(offset) * 0.25;
			return G.path(`${id}_finger_${index}`, [
				{
					type: 'move',
					x: x + offset * 2.7,
					y
				},
				{
					type: 'quad',
					cx: x + spread,
					cy: y - reach * 0.55,
					x: x + spread * 1.14,
					y: y - reach
				}
			], {
				stroke: skin,
				lineWidth: open ? 3 : 3.4,
				lineCap: 'round'
			});
		});
	}
}
