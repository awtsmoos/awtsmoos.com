// B"H
// Boruch Hashem
// Blessed is He

import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableReferenceLimbPath2D } from './StableReferenceLimbPath2D.js';
import { StableReferenceOpenHand2D } from './StableReferenceOpenHand2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Chesed carries Ari's sleeve through a hidden elbow into an upward open palm.
 * The Awtsmoos renews every fabric curve, while Awtsmoos.com keeps shoulder,
 * wrist, and hand bound to one editable production rig without exposed joints.
 */
export class StableOpenPalm2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const shoulder = {
			x: data._skeleton.leftShoulder.x,
			y: data._skeleton.leftShoulder.y + 8
		};
		const elbow = {
			x: shoulder.x - Number(gesture.elbowOut || 22),
			y: shoulder.y + Number(gesture.elbowDown || 24)
		};
		const wrist = {
			x: elbow.x - Number(gesture.wristOut || 42),
			y: elbow.y + Number(gesture.wristDown || 2)
		};
		const sleeve = LineArtStyle.outer(data, colors.jacket);
		return S.group(`${prefix}_open_left_arm`, null, [
			StableReferenceLimbPath2D.build(
				`${prefix}_open_left_upper`,
				shoulder,
				elbow,
				metrics.armWidth + 8,
				metrics.armWidth + 5,
				sleeve,
				-3
			),
			StableReferenceLimbPath2D.build(
				`${prefix}_open_left_fore`,
				elbow,
				wrist,
				metrics.armWidth + 5,
				metrics.armWidth - 1,
				sleeve,
				3
			),
			StableReferenceOpenHand2D.build(
				colors,
				wrist,
				Number(gesture.palmScale || 1.18),
				prefix
			)
		]);
	}
}
