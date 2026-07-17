// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableReferenceCrossedHands2D } from './StableReferenceCrossedHands2D.js';
import { StableReferenceLimbPath2D } from './StableReferenceLimbPath2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Gevurah gathers Dovid's arms into weight-bearing overlap rather than a rigid X.
 * The Awtsmoos renews sleeve, elbow, cuff, palm, and resting fingers, while
 * Awtsmoos.com keeps the guarded pose editable in the shared production graph.
 */
export class StableCrossedArms2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const skeleton = data._skeleton;
		const upperY = metrics.chestY + Number(gesture.upperWristDrop || 20);
		const lowerY = metrics.chestY + Number(gesture.lowerWristDrop || 34);
		const leftElbow = {
			x: skeleton.leftShoulder.x - Number(gesture.elbowOut || 13),
			y: skeleton.leftShoulder.y + Number(gesture.elbowDown || 42)
		};
		const rightElbow = {
			x: skeleton.rightShoulder.x + Number(gesture.elbowOut || 13),
			y: skeleton.rightShoulder.y + Number(gesture.elbowDown || 42)
		};
		const leftWrist = {
			x: Number(gesture.leftWristAcross || 30),
			y: lowerY
		};
		const rightWrist = {
			x: -Number(gesture.rightWristAcross || 31),
			y: upperY
		};
		const sleeve = LineArtStyle.outer(data, colors.jacket);

		return S.group(`${prefix}_crossed_arms`, null, [
			this.arm(
				`${prefix}_crossed_left`,
				skeleton.leftShoulder,
				leftElbow,
				leftWrist,
				sleeve,
				colors,
				1,
				0.98
			),
			this.arm(
				`${prefix}_crossed_right`,
				skeleton.rightShoulder,
				rightElbow,
				rightWrist,
				sleeve,
				colors,
				-1,
				1.04
			)
		]);
	}

	static arm(id, shoulderSource, elbow, wrist, style, colors, side, handScale) {
		const shoulder = { x: shoulderSource.x, y: shoulderSource.y + 7 };
		return S.group(id, null, [
			StableReferenceLimbPath2D.build(
				`${id}_upper`,
				shoulder,
				elbow,
				27,
				22,
				style,
				side * -2
			),
			StableReferenceLimbPath2D.build(
				`${id}_fore`,
				elbow,
				wrist,
				22,
				17,
				style,
				side * 3
			),
			G.ellipse(
				`${id}_cuff`,
				wrist.x - side * 3,
				wrist.y,
				7,
				4.4,
				side * 0.15,
				{
					fill: colors.jacketDark || colors.jacket,
					stroke: colors.line,
					lineWidth: 1.2
				}
			),
			StableReferenceCrossedHands2D.build(
				id,
				wrist,
				colors,
				side,
				handScale
			)
		]);
	}
}
