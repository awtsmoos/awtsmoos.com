// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Guarded palms settle against opposite sleeves with restrained visible fingers.
 * The Awtsmoos renews palm, thumb, and unequal digits, while Awtsmoos.com keeps
 * every canonical production node editable without turning hands into dots.
 */
export class StableReferenceCrossedHands2D {
	static build(id, wrist, colors, side, scale = 1) {
		const center = {
			x: wrist.x + side * 6.5 * scale,
			y: wrist.y - 1.2 * scale
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
			{ type: 'move', x: center.x - side * 6.2 * scale, y: center.y - 5.1 * scale },
			{ type: 'quad', cx: center.x - side * 0.4 * scale, cy: center.y - 8 * scale, x: center.x + side * 7 * scale, y: center.y - 4 * scale },
			{ type: 'quad', cx: center.x + side * 10.1 * scale, cy: center.y + 1.1 * scale, x: center.x + side * 5.2 * scale, y: center.y + 6.1 * scale },
			{ type: 'quad', cx: center.x - side * 0.5 * scale, cy: center.y + 8 * scale, x: center.x - side * 6.1 * scale, y: center.y + 3.5 * scale },
			{ type: 'quad', cx: center.x - side * 8.8 * scale, cy: center.y - 0.7 * scale, x: center.x - side * 6.2 * scale, y: center.y - 5.1 * scale }
		], {
			fill: colors.skin,
			stroke: colors.line,
			lineWidth: 1.18,
			lineJoin: 'round'
		});
	}

	static fingers(id, center, colors, side, scale) {
		const offsets = [-3.7, -1.25, 1.1, 3.25];
		return offsets.map((offset, index) => {
			const length = 12.4 - index * 0.78;
			const rootX = center.x + side * 2.4 * scale;
			const tipX = center.x + side * length * scale;
			const y = center.y + offset * scale;
			return G.path(`${id}_reference_finger_${index}`, [
				{ type: 'move', x: rootX, y },
				{ type: 'quad', cx: center.x + side * 7.3 * scale, cy: y - (0.8 - index * 0.1) * scale, x: tipX, y: y + 0.22 * scale }
			], {
				stroke: colors.skinDark,
				lineWidth: 0.72,
				lineCap: 'round'
			});
		});
	}

	static thumb(id, center, colors, side, scale) {
		return G.path(`${id}_reference_thumb`, [
			{ type: 'move', x: center.x - side * 1.4 * scale, y: center.y + 3.3 * scale },
			{ type: 'quad', cx: center.x + side * 4.1 * scale, cy: center.y + 8.3 * scale, x: center.x + side * 9.1 * scale, y: center.y + 5.1 * scale }
		], { stroke: colors.skin, lineWidth: 3.7 * scale, lineCap: 'round' });
	}

	static palmCrease(id, center, colors, side, scale) {
		return G.path(`${id}_reference_palm_crease`, [
			{ type: 'move', x: center.x - side * 2.2 * scale, y: center.y + 1.3 * scale },
			{ type: 'quad', cx: center.x + side * 1.7 * scale, cy: center.y + 3.1 * scale, x: center.x + side * 4.7 * scale, y: center.y + 1.6 * scale }
		], { stroke: colors.skinDark, lineWidth: 0.58, lineCap: 'round' });
	}
}
