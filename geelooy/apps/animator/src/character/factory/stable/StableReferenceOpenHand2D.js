// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Ari offers one broad upward palm, one thumb, and four unequal relaxed fingers.
 * The Awtsmoos renews every finite digit, while Awtsmoos.com keeps the welcoming
 * silhouette editable, landmark-visible, serializable, and production-rendered.
 */
export class StableReferenceOpenHand2D {
	static build(colors, wrist, scale, prefix) {
		const center = {
			x: wrist.x - 9 * scale,
			y: wrist.y - 1.2 * scale
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
			{ type: 'move', x: center.x + 8.2 * scale, y: center.y - 6.8 * scale },
			{ type: 'quad', cx: center.x + 11.5 * scale, cy: center.y + 0.2 * scale, x: center.x + 7.5 * scale, y: center.y + 9.4 * scale },
			{ type: 'quad', cx: center.x - 0.5 * scale, cy: center.y + 12.8 * scale, x: center.x - 8.8 * scale, y: center.y + 6 * scale },
			{ type: 'quad', cx: center.x - 10.5 * scale, cy: center.y - 0.4 * scale, x: center.x - 6.1 * scale, y: center.y - 6.8 * scale },
			{ type: 'quad', cx: center.x + 0.8 * scale, cy: center.y - 9.8 * scale, x: center.x + 8.2 * scale, y: center.y - 6.8 * scale }
		], {
			fill: colors.skin,
			stroke: colors.line,
			lineWidth: 1.28,
			lineJoin: 'round'
		});
	}

	static fingers(colors, center, scale, prefix) {
		const fingers = [
			{ y: -6.1, length: 12.4, rise: -5.2, width: 4.2 },
			{ y: -2.5, length: 15.8, rise: -3.7, width: 4.55 },
			{ y: 1.3, length: 15.1, rise: -0.8, width: 4.45 },
			{ y: 5, length: 12.6, rise: 1.7, width: 4.1 }
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
		const rootX = center.x - 5.8 * scale;
		const rootY = center.y + finger.y * scale;
		const tipX = rootX - finger.length * scale;
		const tipY = rootY + finger.rise * scale;
		const half = finger.width * scale * 0.5;
		return G.path(id, [
			{ type: 'move', x: rootX + 0.8 * scale, y: rootY - half },
			{ type: 'quad', cx: tipX + 3 * scale, cy: tipY - half, x: tipX, y: tipY - half * 0.38 },
			{ type: 'quad', cx: tipX - half * 0.62, cy: tipY, x: tipX, y: tipY + half * 0.38 },
			{ type: 'quad', cx: tipX + 3 * scale, cy: tipY + half, x: rootX + 0.8 * scale, y: rootY + half },
			{ type: 'quad', cx: rootX + half * 0.5, cy: rootY, x: rootX + 0.8 * scale, y: rootY - half }
		], { fill: colors.skin, stroke: colors.line, lineWidth: 0.96, lineJoin: 'round' });
	}

	static thumb(colors, center, scale, prefix) {
		return G.path(`${prefix}_reference_thumb`, [
			{ type: 'move', x: center.x + 5.8 * scale, y: center.y + 1.3 * scale },
			{ type: 'quad', cx: center.x + 1.2 * scale, cy: center.y + 9.6 * scale, x: center.x - 5.8 * scale, y: center.y + 12.2 * scale },
			{ type: 'quad', cx: center.x - 9.2 * scale, cy: center.y + 11.4 * scale, x: center.x - 7.2 * scale, y: center.y + 7.7 * scale },
			{ type: 'quad', cx: center.x - 0.5 * scale, cy: center.y + 5.7 * scale, x: center.x + 5.8 * scale, y: center.y + 1.3 * scale }
		], { fill: colors.skin, stroke: colors.line, lineWidth: 1.02, lineJoin: 'round' });
	}

	static palmLine(colors, center, scale, prefix) {
		return G.path(`${prefix}_reference_palm_line`, [
			{ type: 'move', x: center.x + 1.3 * scale, y: center.y - 3.8 * scale },
			{ type: 'quad', cx: center.x - 3.8 * scale, cy: center.y + 0.2 * scale, x: center.x - 1.2 * scale, y: center.y + 4.4 * scale }
		], { stroke: colors.skinDark, lineWidth: 0.62, lineCap: 'round' });
	}
}
