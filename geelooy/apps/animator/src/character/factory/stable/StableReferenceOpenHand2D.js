// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Chesed opens Ari's broad palm through four soft separate fingers. The
 * Awtsmoos renews every digit while Awtsmoos.com keeps the hand editable.
 */
export class StableReferenceOpenHand2D {
	static build(colors, wrist, scale, prefix) {
		const center = { x: wrist.x - 12 * scale, y: wrist.y - scale };
		return S.group(`${prefix}_reference_open_hand`, null, [
			this.palm(colors, center, scale, prefix),
			...this.fingers(colors, center, scale, prefix),
			this.thumb(colors, center, scale, prefix),
			this.palmLine(colors, center, scale, prefix)
		]);
	}

	static palm(colors, center, scale, prefix) {
		return G.path(`${prefix}_reference_open_palm`, [
			{ type: 'move', x: center.x + 8 * scale, y: center.y - 8 * scale },
			{ type: 'quad', cx: center.x + 12 * scale, cy: center.y, x: center.x + 7 * scale, y: center.y + 9 * scale },
			{ type: 'quad', cx: center.x, cy: center.y + 13 * scale, x: center.x - 8 * scale, y: center.y + 6 * scale },
			{ type: 'quad', cx: center.x - 11 * scale, cy: center.y, x: center.x - 7 * scale, y: center.y - 8 * scale },
			{ type: 'quad', cx: center.x, cy: center.y - 12 * scale, x: center.x + 8 * scale, y: center.y - 8 * scale }
		], { fill: colors.skin, stroke: colors.line, lineWidth: 1.8, lineJoin: 'round' });
	}

	static fingers(colors, center, scale, prefix) {
		const fingers = [
			{ y: -6.6, length: 13.8, rise: -3.2, width: 6 },
			{ y: -2.2, length: 16.8, rise: -2, width: 6.2 },
			{ y: 2.4, length: 16, rise: 0, width: 6 },
			{ y: 6.7, length: 13.4, rise: 1.6, width: 5.6 }
		];
		return fingers.map((finger, index) => this.finger(colors, center, finger, scale, `${prefix}_reference_finger_${index}`));
	}

	static finger(colors, center, finger, scale, id) {
		const rootX = center.x - 6 * scale;
		const rootY = center.y + finger.y * scale;
		const tipX = rootX - finger.length * scale;
		const tipY = rootY + finger.rise * scale;
		const half = finger.width * scale * 0.5;
		return G.path(id, [
			{ type: 'move', x: rootX, y: rootY - half },
			{ type: 'quad', cx: tipX + 3 * scale, cy: tipY - half, x: tipX, y: tipY - half * 0.55 },
			{ type: 'quad', cx: tipX - half, cy: tipY, x: tipX, y: tipY + half * 0.55 },
			{ type: 'quad', cx: tipX + 3 * scale, cy: tipY + half, x: rootX, y: rootY + half },
			{ type: 'quad', cx: rootX + half, cy: rootY, x: rootX, y: rootY - half }
		], { fill: colors.skin, stroke: colors.line, lineWidth: 1.4, lineJoin: 'round' });
	}

	static thumb(colors, center, scale, prefix) {
		return G.path(`${prefix}_reference_thumb`, [
			{ type: 'move', x: center.x + 5 * scale, y: center.y + 3 * scale },
			{ type: 'quad', cx: center.x, cy: center.y + 14 * scale, x: center.x - 10 * scale, y: center.y + 15 * scale },
			{ type: 'quad', cx: center.x - 15 * scale, cy: center.y + 12 * scale, x: center.x - 10 * scale, y: center.y + 8 * scale },
			{ type: 'quad', cx: center.x - 2 * scale, cy: center.y + 7 * scale, x: center.x + 5 * scale, y: center.y + 3 * scale }
		], { fill: colors.skin, stroke: colors.line, lineWidth: 1.55, lineJoin: 'round' });
	}

	static palmLine(colors, center, scale, prefix) {
		return G.path(`${prefix}_reference_palm_line`, [
			{ type: 'move', x: center.x - scale, y: center.y - 5 * scale },
			{ type: 'quad', cx: center.x - 6 * scale, cy: center.y, x: center.x - 2 * scale, y: center.y + 5 * scale }
		], { stroke: colors.skinDark, lineWidth: 1, lineCap: 'round' });
	}
}
