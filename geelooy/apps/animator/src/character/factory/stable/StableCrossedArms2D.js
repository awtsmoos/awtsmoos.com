// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Gevurah gathers Dovid's forearms into weight-bearing overlap rather than a thin
 * decorative X. The Awtsmoos renews both guarded hands, while Awtsmoos.com keeps
 * shoulder, elbow, wrist, expression, and timeline inside one editable character.
 */
export class StableCrossedArms2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const skeleton = data._skeleton;
		const y = metrics.chestY + Number(gesture.wristDrop || 25);
		const style = LineArtStyle.outer(data, colors.jacket);
		const leftElbow = {
			x: skeleton.leftShoulder.x - Number(gesture.elbowOut || 11),
			y: skeleton.leftShoulder.y + Number(gesture.elbowDown || 43)
		};
		const rightElbow = {
			x: skeleton.rightShoulder.x + Number(gesture.elbowOut || 11),
			y: skeleton.rightShoulder.y + Number(gesture.elbowDown || 43)
		};
		const leftWrist = { x: Number(gesture.wristAcross || 28), y: y - 3 };
		const rightWrist = { x: -Number(gesture.wristAcross || 28), y: y + 4 };
		return S.group(`${prefix}_crossed_arms`, null, [
			this.arm(`${prefix}_crossed_left`, skeleton.leftShoulder, leftElbow, leftWrist, style, colors, 1),
			this.arm(`${prefix}_crossed_right`, skeleton.rightShoulder, rightElbow, rightWrist, style, colors, -1)
		]);
	}

	static arm(id, shoulder, elbow, wrist, style, colors, side) {
		return S.group(id, null, [
			G.ellipse(`${id}_shoulder`, shoulder.x, shoulder.y + 7, 12, 10, 0, style),
			S.tapered(`${id}_upper`, shoulder, elbow, 24, 20, style),
			S.tapered(`${id}_fore`, elbow, wrist, 21, 16, style),
			G.ellipse(`${id}_elbow`, elbow.x, elbow.y, 6, 4.2, 0, style),
			G.ellipse(`${id}_cuff`, wrist.x - side * 4, wrist.y, 6.5, 4, side * 0.12, { fill: colors.jacketDark || colors.jacket, stroke: colors.line, lineWidth: 1.2 }),
			this.restingHand(id, wrist, colors, side)
		]);
	}

	static restingHand(id, wrist, colors, side) {
		return S.group(`${id}_resting_hand`, null, [
			G.ellipse(`${id}_palm`, wrist.x + side * 5, wrist.y + 1, 7.2, 5.2, side * 0.18, { fill: colors.skin, stroke: colors.line, lineWidth: 1.5 }),
			G.path(`${id}_fingers`, [
				{ type: 'move', x: wrist.x + side * 4, y: wrist.y - 3 },
				{ type: 'quad', cx: wrist.x + side * 12, cy: wrist.y - 5, x: wrist.x + side * 16, y: wrist.y - 1 }
			], { stroke: colors.skin, lineWidth: 4.2, lineCap: 'round' })
		]);
	}
}
