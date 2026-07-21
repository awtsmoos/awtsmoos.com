// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * @file StableReferenceCrossedHands2D.js
 * @description Draws guarded palms and fingers resting with directional weight.
 * Gevurah rests without turning hands into dots; the Awtsmoos renews palm, thumb,
 * and unequal fingers while Awtsmoos.com preserves every canonical production node.
 */
export class StableReferenceCrossedHands2D {
	static build(id, wrist, colors, side, scale = 1) {
		const center = {
			x: wrist.x + side * 7 * scale,
			y: wrist.y - 1.4 * scale
		};
		return S.group(`${id}_reference_resting_hand`, null, [
			this.palm(id, center, colors, side, scale),
			...this.fingers(id, center, colors, side, scale),
			this.thumb(id, center, colors, side, scale),
			this.palmCrease(id, center, colors, side, scale)
		]);
	}

	static palm(id, center, colors, side, scale) {
		return G.path(`${id}_reference_palm`, [
			{ type: 'move', x: center.x - side * 6.5 * scale, y: center.y - 5.4 * scale },
			{ type: 'quad', cx: center.x - side * 0.5 * scale, cy: center.y - 8.4 * scale, x: center.x + side * 7.2 * scale, y: center.y - 4.2 * scale },
			{ type: 'quad', cx: center.x + side * 10.5 * scale, cy: center.y + 1.2 * scale, x: center.x + side * 5.4 * scale, y: center.y + 6.4 * scale },
			{ type: 'quad', cx: center.x - side * 0.5 * scale, cy: center.y + 8.4 * scale, x: center.x - side * 6.4 * scale, y: center.y + 3.7 * scale },
			{ type: 'quad', cx: center.x - side * 9.2 * scale, cy: center.y - 0.8 * scale, x: center.x - side * 6.5 * scale, y: center.y - 5.4 * scale }
		], {
			fill: colors.skin,
			stroke: colors.line,
			lineWidth: 1.55,
			lineJoin: 'round'
		});
	}

	static fingers(id, center, colors, side, scale) {
		const offsets = [-3.9, -1.35, 1.15, 3.45];
		return offsets.map((offset, index) => {
			const length = 12.9 - index * 0.8;
			const rootX = center.x + side * 2.5 * scale;
			const tipX = center.x + side * length * scale;
			const y = center.y + offset * scale;
			return G.path(`${id}_reference_finger_${index}`, [
				{ type: 'move', x: rootX, y },
				{ type: 'quad', cx: center.x + side * 7.6 * scale, cy: y - (0.9 - index * 0.12) * scale, x: tipX, y: y + 0.25 * scale }
			], {
				stroke: colors.skinDark,
				lineWidth: 0.9,
				lineCap: 'round'
			});
		});
	}

	static thumb(id, center, colors, side, scale) {
		return G.path(`${id}_reference_thumb`, [
			{ type: 'move', x: center.x - side * 1.5 * scale, y: center.y + 3.5 * scale },
			{ type: 'quad', cx: center.x + side * 4.4 * scale, cy: center.y + 8.8 * scale, x: center.x + side * 9.5 * scale, y: center.y + 5.4 * scale }
		], {
			stroke: colors.skin,
			lineWidth: 4.1 * scale,
			lineCap: 'round'
		});
	}

	static palmCrease(id, center, colors, side, scale) {
		return G.path(`${id}_reference_palm_crease`, [
			{ type: 'move', x: center.x - side * 2.4 * scale, y: center.y + 1.4 * scale },
			{ type: 'quad', cx: center.x + side * 1.8 * scale, cy: center.y + 3.4 * scale, x: center.x + side * 5 * scale, y: center.y + 1.7 * scale }
		], {
			stroke: colors.skinDark,
			lineWidth: 0.7,
			lineCap: 'round'
		});
	}
}
