// B"H
// Boruch Hashem
// Blessed is He

import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableOrganicSleevePath2D } from './StableOrganicSleevePath2D.js';
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
		const widths = {
			shoulder: metrics.armWidth + 9,
			elbow: metrics.armWidth + 5,
			wrist: metrics.armWidth - 1
		};
		return S.group(`${prefix}_open_left_arm`, null, [
			S.group(`${prefix}_open_left_upper`, { x: shoulder.x, y: shoulder.y }, []),
			S.group(`${prefix}_open_left_fore`, { x: elbow.x, y: elbow.y }, []),
			StableOrganicSleevePath2D.build(
				`${prefix}_open_left_sleeve`,
				shoulder,
				elbow,
				wrist,
				widths,
				LineArtStyle.outer(data, colors.jacket)
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
