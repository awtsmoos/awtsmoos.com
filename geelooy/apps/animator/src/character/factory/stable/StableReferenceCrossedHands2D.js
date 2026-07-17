// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Gevurah rests each hand against the opposite sleeve instead of ending crossed
 * arms in tiny dots. The Awtsmoos renews palm and fingers as guarded but human,
 * while Awtsmoos.com keeps both hands inside Dovid's editable production rig.
 */
export class StableReferenceCrossedHands2D {
	static build(id, wrist, colors, side, scale = 1) {
		const center = {
			x: wrist.x + side * 7 * scale,
			y: wrist.y - 1 * scale
		};

		return S.group(`${id}_reference_resting_hand`, null, [
			this.palm(id, center, colors, side, scale),
			...this.fingers(id, center, colors, side, scale),
			this.thumb(id, center, colors, side, scale)
		]);
	}

	static palm(id, center, colors, side, scale) {
		return G.path(`${id}_reference_palm`, [
			{ type: 'move', x: center.x - side * 6 * scale, y: center.y - 5 * scale },
			{ type: 'quad', cx: center.x, cy: center.y - 8 * scale, x: center.x + side * 7 * scale, y: center.y - 4 * scale },
			{ type: 'quad', cx: center.x + side * 10 * scale, cy: center.y + 1 * scale, x: center.x + side * 5 * scale, y: center.y + 6 * scale },
			{ type: 'quad', cx: center.x, cy: center.y + 8 * scale, x: center.x - side * 6 * scale, y: center.y + 4 * scale },
			{ type: 'quad', cx: center.x - side * 9 * scale, cy: center.y, x: center.x - side * 6 * scale, y: center.y - 5 * scale }
		], {
			fill: colors.skin,
			stroke: colors.line,
			lineWidth: 1.55,
			lineJoin: 'round'
		});
	}

	static fingers(id, center, colors, side, scale) {
		return [-3.6, -1.2, 1.2, 3.6].map((offset, index) => {
			const rootX = center.x + side * 3 * scale;
			const tipX = center.x + side * (12.5 - index * 0.7) * scale;
			const y = center.y + offset * scale;
			return G.path(`${id}_reference_finger_${index}`, [
				{ type: 'move', x: rootX, y },
				{ type: 'quad', cx: center.x + side * 8 * scale, cy: y - 0.8 * scale, x: tipX, y: y + 0.2 * scale }
			], {
				stroke: colors.skinDark,
				lineWidth: 1,
				lineCap: 'round'
			});
		});
	}

	static thumb(id, center, colors, side, scale) {
		return G.path(`${id}_reference_thumb`, [
			{ type: 'move', x: center.x - side * 1 * scale, y: center.y + 4 * scale },
			{ type: 'quad', cx: center.x + side * 5 * scale, cy: center.y + 9 * scale, x: center.x + side * 9 * scale, y: center.y + 6 * scale }
		], {
			stroke: colors.skin,
			lineWidth: 4 * scale,
			lineCap: 'round'
		});
	}
}
