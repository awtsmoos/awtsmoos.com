// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableReferenceLimbPath2D } from './StableReferenceLimbPath2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Miriam's free sleeve bends without a socket or elbow disk and ends in a calm,
 * open five-digit hand. The Awtsmoos renews every finite curve, while Awtsmoos.com
 * keeps the gesture deterministic, editable, serializable, and exportable.
 */
export class StableCalmLeftArm2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const shoulder = {
			x: data._skeleton.leftShoulder.x,
			y: data._skeleton.leftShoulder.y + 5
		};
		const elbow = {
			x: shoulder.x + Number(gesture.leftElbowOut ?? -4),
			y: shoulder.y + Number(gesture.leftElbowDown ?? 45)
		};
		const wrist = {
			x: shoulder.x + Number(gesture.leftWristOut ?? 10),
			y: shoulder.y + Number(gesture.leftWristDown ?? 94)
		};
		const sleeve = LineArtStyle.exterior(data, colors.jacket);
		return S.group(`${prefix}_left_arm_connected`, null, [
			StableReferenceLimbPath2D.build(
				`${prefix}_left_arm_connected_upper`,
				shoulder,
				elbow,
				metrics.armWidth + 6,
				metrics.armWidth + 2,
				sleeve,
				-2
			),
			StableReferenceLimbPath2D.build(
				`${prefix}_left_arm_connected_fore`,
				elbow,
				wrist,
				metrics.armWidth + 2,
				metrics.armWidth - 1,
				sleeve,
				3
			),
			this.cuff(data, colors, wrist, prefix),
			this.hand(data, colors, wrist, prefix, Number(gesture.leftHandScale || 1.08))
		]);
	}

	static cuff(data, colors, wrist, prefix) {
		return G.ellipse(
			`${prefix}_left_arm_connected_cuff`,
			wrist.x,
			wrist.y - 3,
			5.2,
			3,
			-0.08,
			LineArtStyle.medium(data, colors.jacketDark || colors.jacket)
		);
	}

	static hand(data, colors, wrist, prefix, scale) {
		const x = wrist.x;
		const y = wrist.y + 5.8 * scale;
		return S.group(`${prefix}_left_arm_connected_hand`, null, [
			G.ellipse(`${prefix}_left_arm_connected_hand_palm`, x, y, 6.2 * scale, 8.5 * scale, -0.08, LineArtStyle.medium(data, colors.skin)),
			this.digit(colors, `${prefix}_left_arm_connected_hand_thumb`, x - 3.8 * scale, y - 0.4 * scale, -5.8, 2.8, 1.45 * scale),
			this.digit(colors, `${prefix}_left_arm_connected_hand_finger_1`, x - 2.7 * scale, y + 4.2 * scale, -4.5, 5.8, 1.05 * scale),
			this.digit(colors, `${prefix}_left_arm_connected_hand_finger_2`, x - 0.9 * scale, y + 5 * scale, -1.7, 7, 1.05 * scale),
			this.digit(colors, `${prefix}_left_arm_connected_hand_finger_3`, x + 1.1 * scale, y + 4.8 * scale, 1.2, 6.6, 1 * scale),
			this.digit(colors, `${prefix}_left_arm_connected_hand_finger_4`, x + 2.8 * scale, y + 3.8 * scale, 3.4, 5.2, 0.95 * scale)
		]);
	}

	static digit(colors, id, x, y, offsetX, offsetY, width) {
		return G.path(id, [
			{ type: 'move', x, y },
			{ type: 'quad', cx: x + offsetX * 0.55, cy: y + offsetY * 0.45, x: x + offsetX, y: y + offsetY }
		], { stroke: colors.line, lineWidth: width, lineCap: 'round' });
	}
}
