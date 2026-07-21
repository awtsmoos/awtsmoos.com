// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Chesed reveals one broad palm, one thumb, and four relaxed unequal fingers.
 * The Awtsmoos renews every finite digit, while Awtsmoos.com keeps the welcoming
 * hand editable, landmark-visible, serializable, and shared by preview and export.
 */
export class StableReferenceOpenHand2D {
	static build(colors, wrist, scale, prefix) {
		const center = {
			x: wrist.x - 8.5 * scale,
			y: wrist.y - 1.5 * scale
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
			{ type: 'move', x: center.x + 8 * scale, y: center.y - 7 * scale },
			{ type: 'quad', cx: center.x + 10.5 * scale, cy: center.y, x: center.x + 7.8 * scale, y: center.y + 8 * scale },
			{ type: 'quad', cx: center.x, cy: center.y + 11 * scale, x: center.x - 7.5 * scale, y: center.y + 5.5 * scale },
			{ type: 'quad', cx: center.x - 10 * scale, cy: center.y - 0.5 * scale, x: center.x - 6.5 * scale, y: center.y - 7 * scale },
			{ type: 'quad', cx: center.x + 0.8 * scale, cy: center.y - 9.5 * scale, x: center.x + 8 * scale, y: center.y - 7 * scale }
		], {
			fill: colors.skin,
			stroke: colors.line,
			lineWidth: 1.5,
			lineJoin: 'round'
		});
	}

	static fingers(colors, center, scale, prefix) {
		const fingers = [
			{ y: -6, length: 12.2, rise: -6, width: 4.5 },
			{ y: -2.3, length: 15.5, rise: -4.2, width: 4.9 },
			{ y: 1.5, length: 15, rise: -1.4, width: 4.8 },
			{ y: 5.1, length: 12.5, rise: 1.8, width: 4.4 }
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
			{ type: 'quad', cx: tipX + 2.8 * scale, cy: tipY - half, x: tipX, y: tipY - half * 0.45 },
			{ type: 'quad', cx: tipX - half * 0.7, cy: tipY, x: tipX, y: tipY + half * 0.45 },
			{ type: 'quad', cx: tipX + 2.8 * scale, cy: tipY + half, x: rootX, y: rootY + half },
			{ type: 'quad', cx: rootX + half * 0.5, cy: rootY, x: rootX, y: rootY - half }
		], {
			fill: colors.skin,
			stroke: colors.line,
			lineWidth: 1.14,
			lineJoin: 'round'
		});
	}

	static thumb(colors, center, scale, prefix) {
		return G.path(`${prefix}_reference_thumb`, [
			{ type: 'move', x: center.x + 5.5 * scale, y: center.y + 2 * scale },
			{ type: 'quad', cx: center.x + 1 * scale, cy: center.y + 10 * scale, x: center.x - 5.5 * scale, y: center.y + 12.5 * scale },
			{ type: 'quad', cx: center.x - 9.5 * scale, cy: center.y + 12 * scale, x: center.x - 7.5 * scale, y: center.y + 8.5 * scale },
			{ type: 'quad', cx: center.x - 1 * scale, cy: center.y + 6.5 * scale, x: center.x + 5.5 * scale, y: center.y + 2 * scale }
		], {
			fill: colors.skin,
			stroke: colors.line,
			lineWidth: 1.22,
			lineJoin: 'round'
		});
	}

	static palmLine(colors, center, scale, prefix) {
		return G.path(`${prefix}_reference_palm_line`, [
			{ type: 'move', x: center.x + 0.5 * scale, y: center.y - 4.2 * scale },
			{ type: 'quad', cx: center.x - 3.8 * scale, cy: center.y, x: center.x - 1.2 * scale, y: center.y + 4.2 * scale }
		], {
			stroke: colors.skinDark,
			lineWidth: 0.78,
			lineCap: 'round'
		});
	}
}
