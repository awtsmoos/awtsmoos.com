// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Chesed opens Ari's hand sideways toward the listener. The Awtsmoos renews palm,
 * thumb, and each finger as readable vector vessels, while Awtsmoos.com keeps the
 * gesture attached to shoulder, elbow, wrist, timeline, and serialized character.
 */
export class StableOpenPalm2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const shoulder = data._skeleton.leftShoulder;
		const elbow = {
			x: shoulder.x - Number(gesture.elbowOut || 31),
			y: shoulder.y + Number(gesture.elbowDown || 34)
		};
		const wrist = {
			x: elbow.x - Number(gesture.wristOut || 38),
			y: elbow.y + Number(gesture.wristDown || 10)
		};
		const sleeve = LineArtStyle.outer(data, colors.jacket);
		return S.group(`${prefix}_open_left_arm`, null, [
			S.tapered(`${prefix}_open_left_upper`, shoulder, elbow, metrics.armWidth + 11, metrics.armWidth + 6, sleeve),
			S.tapered(`${prefix}_open_left_fore`, elbow, wrist, metrics.armWidth + 6, metrics.armWidth + 2, sleeve),
			G.ellipse(`${prefix}_open_left_elbow`, elbow.x, elbow.y, 6, 4, 0, sleeve),
			G.ellipse(`${prefix}_open_left_cuff`, wrist.x + 3, wrist.y, 7, 4.2, -0.18, { fill: colors.jacket, stroke: colors.line, lineWidth: 1.4 }),
			this.hand(colors, wrist, Number(gesture.palmScale || 1.7), prefix)
		]);
	}

	static hand(colors, wrist, scale, prefix) {
		const palm = { x: wrist.x - 11 * scale, y: wrist.y + 1 };
		return S.group(`${prefix}_open_left_hand`, null, [
			G.ellipse(`${prefix}_open_left_palm`, palm.x, palm.y, 8.4 * scale, 7.4 * scale, -0.08, { fill: colors.skin, stroke: colors.line, lineWidth: 1.7 }),
			...this.fingers(colors, palm, scale, prefix),
			...this.thumb(colors, palm, scale, prefix)
		]);
	}

	static fingers(colors, palm, scale, prefix) {
		return [-0.72, -0.24, 0.24, 0.72].flatMap((ratio, index) => {
			const start = { x: palm.x - 5.8 * scale, y: palm.y + ratio * 6 * scale };
			const end = { x: palm.x - (15.5 + (1.5 - Math.abs(ratio)) * 2) * scale, y: palm.y + ratio * 7.1 * scale };
			const commands = [
				{ type: 'move', x: start.x, y: start.y },
				{ type: 'quad', cx: end.x + 3 * scale, cy: end.y - ratio * scale, x: end.x, y: end.y }
			];
			return [
				G.path(`${prefix}_finger_outline_${index}`, commands, { stroke: colors.line, lineWidth: 4.8 * scale, lineCap: 'round' }),
				G.path(`${prefix}_finger_skin_${index}`, commands, { stroke: colors.skin, lineWidth: 3.2 * scale, lineCap: 'round' })
			];
		});
	}

	static thumb(colors, palm, scale, prefix) {
		const commands = [
			{ type: 'move', x: palm.x - 3 * scale, y: palm.y + 5 * scale },
			{ type: 'quad', cx: palm.x - 9 * scale, cy: palm.y + 13 * scale, x: palm.x - 14 * scale, y: palm.y + 10 * scale }
		];
		return [
			G.path(`${prefix}_thumb_outline`, commands, { stroke: colors.line, lineWidth: 5.2 * scale, lineCap: 'round' }),
			G.path(`${prefix}_thumb_skin`, commands, { stroke: colors.skin, lineWidth: 3.6 * scale, lineCap: 'round' })
		];
	}
}
