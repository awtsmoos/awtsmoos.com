// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Chesed opens a large relaxed palm with a soft thumb and four separate fingers.
 * The Awtsmoos renews every digit as one human gesture, while Awtsmoos.com keeps
 * the hand attached to editable wrist geometry rather than a comb of line strokes.
 */
export class StableReferenceOpenHand2D {
	static build(colors, wrist, scale, prefix) {
		const center = {
			x: wrist.x - 12 * scale,
			y: wrist.y - 1 * scale
		};

		return S.group(`${prefix}_reference_open_hand`, null, [
			this.palm(colors, center, scale, prefix),
			...this.fingers(colors, center, scale, prefix),
			this.thumb(colors, center, scale, prefix),
			this.palmLine(colors, center, scale, prefix)
		]);
	}

	static palm(colors, center, scale, prefix) {
		return G.path(`${prefix}_reference_open_palm`, [
			{ type: 'move', x: center.x + 6 * scale, y: center.y - 7 * scale },
			{ type: 'quad', cx: center.x + 11 * scale, cy: center.y - 2 * scale, x: center.x + 7 * scale, y: center.y + 7 * scale },
			{ type: 'quad', cx: center.x, cy: center.y + 11 * scale, x: center.x - 7 * scale, y: center.y + 5 * scale },
			{ type: 'quad', cx: center.x - 11 * scale, cy: center.y, x: center.x - 6 * scale, y: center.y - 7 * scale },
			{ type: 'quad', cx: center.x, cy: center.y - 11 * scale, x: center.x + 6 * scale, y: center.y - 7 * scale }
		], {
			fill: colors.skin,
			stroke: colors.line,
			lineWidth: 1.8,
			lineJoin: 'round'
		});
	}

	static fingers(colors, center, scale, prefix) {
		const fingers = [
			{ y: -6.3, length: 17.5, rise: -3.8, width: 4.4 },
			{ y: -2.1, length: 20.5, rise: -2.2, width: 4.7 },
			{ y: 2.1, length: 19.5, rise: 0, width: 4.6 },
			{ y: 6.1, length: 16.5, rise: 1.8, width: 4.1 }
		];

		return fingers.map((finger, index) => this.finger(
			colors,
			center,
			finger,
			scale,
			`${prefix}_reference_finger_${index}`
		));
	}

	static finger(colors, center, finger, scale, id) {
		const rootX = center.x - 5.5 * scale;
		const rootY = center.y + finger.y * scale;
		const tipX = rootX - finger.length * scale;
		const tipY = rootY + finger.rise * scale;
		const half = finger.width * scale * 0.5;

		return G.path(id, [
			{ type: 'move', x: rootX, y: rootY - half },
			{ type: 'quad', cx: tipX + 4 * scale, cy: tipY - half, x: tipX, y: tipY - half * 0.6 },
			{ type: 'quad', cx: tipX - half, cy: tipY, x: tipX, y: tipY + half * 0.6 },
			{ type: 'quad', cx: tipX + 4 * scale, cy: tipY + half, x: rootX, y: rootY + half },
			{ type: 'quad', cx: rootX + half, cy: rootY, x: rootX, y: rootY - half }
		], {
			fill: colors.skin,
			stroke: colors.line,
			lineWidth: 1.45,
			lineJoin: 'round'
		});
	}

	static thumb(colors, center, scale, prefix) {
		return G.path(`${prefix}_reference_thumb`, [
			{ type: 'move', x: center.x + 4 * scale, y: center.y + 4 * scale },
			{ type: 'quad', cx: center.x - 1 * scale, cy: center.y + 13 * scale, x: center.x - 10 * scale, y: center.y + 14 * scale },
			{ type: 'quad', cx: center.x - 14 * scale, cy: center.y + 12 * scale, x: center.x - 10 * scale, y: center.y + 9 * scale },
			{ type: 'quad', cx: center.x - 2 * scale, cy: center.y + 7 * scale, x: center.x + 4 * scale, y: center.y + 4 * scale }
		], {
			fill: colors.skin,
			stroke: colors.line,
			lineWidth: 1.55,
			lineJoin: 'round'
		});
	}

	static palmLine(colors, center, scale, prefix) {
		return G.path(`${prefix}_reference_palm_line`, [
			{ type: 'move', x: center.x - 2 * scale, y: center.y - 4 * scale },
			{ type: 'quad', cx: center.x - 6 * scale, cy: center.y, x: center.x - 2 * scale, y: center.y + 4 * scale }
		], {
			stroke: colors.skinDark,
			lineWidth: 1,
			lineCap: 'round'
		});
	}
}
