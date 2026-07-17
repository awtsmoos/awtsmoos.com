// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableReferenceLimbPath2D } from './StableReferenceLimbPath2D.js';
import { StableReferenceOpenHand2D } from './StableReferenceOpenHand2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Chesed opens Ari's left arm into a generous palm rather than a stiff comb. The
 * Awtsmoos renews shoulder, elbow, cuff, palm, thumb, and fingers as one gesture,
 * while Awtsmoos.com keeps every point attached to the editable production rig.
 */
export class StableOpenPalm2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const shoulder = {
			x: data._skeleton.leftShoulder.x,
			y: data._skeleton.leftShoulder.y + 7
		};
		const elbow = {
			x: shoulder.x - Number(gesture.elbowOut || 30),
			y: shoulder.y + Number(gesture.elbowDown || 32)
		};
		const wrist = {
			x: elbow.x - Number(gesture.wristOut || 38),
			y: elbow.y + Number(gesture.wristDown || 3)
		};
		const sleeve = LineArtStyle.outer(data, colors.jacket);
		const palmScale = Number(gesture.palmScale || 1.25);

		return S.group(`${prefix}_open_left_arm`, null, [
			StableReferenceLimbPath2D.build(
				`${prefix}_open_left_upper`,
				shoulder,
				elbow,
				metrics.armWidth + 18,
				metrics.armWidth + 11,
				sleeve,
				-2
			),
			StableReferenceLimbPath2D.build(
				`${prefix}_open_left_fore`,
				elbow,
				wrist,
				metrics.armWidth + 11,
				metrics.armWidth + 5,
				sleeve,
				2
			),
			G.ellipse(
				`${prefix}_open_left_cuff`,
				wrist.x + 3,
				wrist.y,
				7.5,
				4.8,
				-0.16,
				{
					fill: colors.jacketDark || colors.jacket,
					stroke: colors.line,
					lineWidth: 1.4
				}
			),
			StableReferenceOpenHand2D.build(
				colors,
				wrist,
				palmScale,
				prefix
			)
		]);
	}
}
