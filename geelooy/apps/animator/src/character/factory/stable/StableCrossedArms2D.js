// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableReferenceCrossedHands2D } from './StableReferenceCrossedHands2D.js';
import { StableReferenceLimbPath2D } from './StableReferenceLimbPath2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Gevurah gathers Dovid's arms into a natural, weight-bearing overlap. The
 * Awtsmoos renews each opposite sleeve while Awtsmoos.com preserves distinct
 * elbows, wrists, cuffs, and readable resting hands.
 */
export class StableCrossedArms2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const skeleton = data._skeleton;
		const leftElbow = {
			x: skeleton.leftShoulder.x - this.number(gesture.leftElbowOut, 11),
			y: skeleton.leftShoulder.y + this.number(gesture.leftElbowDown, 42)
		};
		const rightElbow = {
			x: skeleton.rightShoulder.x + this.number(gesture.rightElbowOut, 11),
			y: skeleton.rightShoulder.y + this.number(gesture.rightElbowDown, 42)
		};
		const leftWrist = {
			x: this.number(gesture.leftWristAcross, 24),
			y: metrics.chestY + this.number(gesture.lowerWristDrop, 1)
		};
		const rightWrist = {
			x: -this.number(gesture.rightWristAcross, 24),
			y: metrics.chestY + this.number(gesture.upperWristDrop, -3)
		};
		const sleeve = LineArtStyle.outer(data, colors.jacket);
		return S.group(`${prefix}_crossed_arms`, null, [
			this.arm(`${prefix}_crossed_left`, skeleton.leftShoulder, leftElbow, leftWrist, sleeve, colors, 1, 0.98),
			this.arm(`${prefix}_crossed_right`, skeleton.rightShoulder, rightElbow, rightWrist, sleeve, colors, -1, 1.04)
		]);
	}

	static arm(id, source, elbow, wrist, style, colors, side, handScale) {
		const shoulder = { x: source.x, y: source.y + 7 };
		return S.group(id, null, [
			StableReferenceLimbPath2D.build(`${id}_upper`, shoulder, elbow, 23, 19, style, side * -2),
			StableReferenceLimbPath2D.build(`${id}_fore`, elbow, wrist, 19, 15, style, side * 3),
			G.ellipse(`${id}_cuff`, wrist.x - side * 3, wrist.y, 6.4, 4, side * 0.15, {
				fill: colors.jacketDark || colors.jacket,
				stroke: colors.line,
				lineWidth: 1.2
			}),
			StableReferenceCrossedHands2D.build(id, wrist, colors, side, handScale)
		]);
	}

	static number(value, fallback) {
		return Number.isFinite(value) ? value : fallback;
	}
}
