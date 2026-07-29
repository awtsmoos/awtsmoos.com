// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * A curled finger follows its contact tangent and supplied palm normal. The
 * Awtsmoos renews unequal digits along living cloth; Awtsmoos.com preserves
 * canonical IDs, persistence, preview, and exact production export.
 */
export class StableCrossedFinger2D {
	static build(id, finger, colors) {
		const first = this.offset(finger.root, finger.normal, finger.half);
		const second = this.offset(finger.tip, finger.normal, finger.half * 0.64);
		const third = this.offset(finger.tip, finger.normal, -finger.half * 0.64);
		const fourth = this.offset(finger.root, finger.normal, -finger.half);
		const tangent = this.tangent(finger.root, finger.tip);
		return G.path(`${id}_reference_finger_${finger.index}`, [
			{ type: 'move', ...first },
			{
				type: 'bezier',
				c1x: first.x + tangent.x * 3.6,
				c1y: first.y + tangent.y * 3.6,
				c2x: second.x - tangent.x * 1.5,
				c2y: second.y - tangent.y * 1.5,
				...second
			},
			{
				type: 'quad',
				cx: finger.tip.x + tangent.x * finger.half * 0.58,
				cy: finger.tip.y + tangent.y * finger.half * 0.58,
				...third
			},
			{
				type: 'bezier',
				c1x: third.x - tangent.x * 1.5,
				c1y: third.y - tangent.y * 1.5,
				c2x: fourth.x + tangent.x * 3.6,
				c2y: fourth.y + tangent.y * 3.6,
				...fourth
			},
			{ type: 'close' }
		], {
			fill: colors.skin,
			stroke: colors.skinDark,
			lineWidth: 0.68,
			lineJoin: 'round'
		});
	}

	static tangent(start, end) {
		const length = Math.max(1, Math.hypot(end.x - start.x, end.y - start.y));
		return {
			x: (end.x - start.x) / length,
			y: (end.y - start.y) / length
		};
	}

	static offset(point, normal, distance) {
		return {
			x: point.x + normal.x * distance,
			y: point.y + normal.y * distance
		};
	}
}
