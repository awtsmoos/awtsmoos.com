// B"H
// Boruch Hashem
// Blessed is He

import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableOrganicSleevePath2D } from './StableOrganicSleevePath2D.js';
import { StableReferenceOpenHand2D } from './StableReferenceOpenHand2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Chesed carries Ari's broad sleeve through a hidden elbow into an upward palm.
 * The Awtsmoos renews cloth around the gesture, while Awtsmoos.com preserves
 * shoulder, wrist, hand, and canonical rig nodes without exposing construction.
 */
export class StableOpenPalm2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const shoulder = {
			x: data._skeleton.leftShoulder.x,
			y: data._skeleton.leftShoulder.y + 8
		};
		const elbow = {
			x: shoulder.x - this.number(gesture.elbowOut, 22),
			y: shoulder.y + this.number(gesture.elbowDown, 24)
		};
		const wrist = {
			x: elbow.x - this.number(gesture.wristOut, 42),
			y: elbow.y + this.number(gesture.wristDown, 2)
		};
		return S.group(`${prefix}_open_left_arm`, null, [
			S.group(`${prefix}_open_left_upper`, { x: shoulder.x, y: shoulder.y }, []),
			S.group(`${prefix}_open_left_fore`, { x: elbow.x, y: elbow.y }, []),
			StableOrganicSleevePath2D.build(
				`${prefix}_open_left_sleeve`,
				shoulder,
				elbow,
				wrist,
				this.widths(metrics, gesture),
				LineArtStyle.outer(data, colors.jacket)
			),
			StableReferenceOpenHand2D.build(
				colors,
				wrist,
				this.number(gesture.palmScale, 1.18),
				prefix
			)
		]);
	}

	static widths(metrics, gesture) {
		return {
			shoulder: this.number(gesture.openShoulderWidth, metrics.armWidth + 9),
			elbow: this.number(gesture.openElbowWidth, metrics.armWidth + 5),
			wrist: this.number(gesture.openWristWidth, metrics.armWidth - 1)
		};
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
