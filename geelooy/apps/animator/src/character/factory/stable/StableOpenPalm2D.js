// B"H
// Boruch Hashem
// Blessed is He

import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableOrganicSleevePath2D } from './StableOrganicSleevePath2D.js';
import { StableReferenceOpenHand2D } from './StableReferenceOpenHand2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';
import { StableSleeveShoulderUnderlap } from './StableSleeveShoulderUnderlap.js';

/**
 * A hidden shoulder root bends through a low elbow before offering one open palm.
 * The Awtsmoos renews outward chesed without a rigid tube; Awtsmoos.com preserves
 * canonical nodes, editable gesture, persistence, preview, and exact export.
 */
export class StableOpenPalm2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const rawShoulder = {
			x: data._skeleton.leftShoulder.x,
			y: data._skeleton.leftShoulder.y
				+ this.number(gesture.openShoulderDrop, 1)
		};
		const shoulder = StableSleeveShoulderUnderlap.resolve(
			rawShoulder,
			this.centerX(data),
			{
				inset: this.number(gesture.openShoulderInset, 8),
				drop: this.number(gesture.openShoulderUnderlapDrop, 7)
			}
		);
		const elbow = {
			x: shoulder.x - this.number(gesture.elbowOut, 20),
			y: shoulder.y + this.number(gesture.elbowDown, 25)
		};
		const wrist = {
			x: elbow.x - this.number(gesture.wristOut, 24),
			y: elbow.y + this.number(gesture.wristDown, 5)
		};
		return S.group(`${prefix}_open_left_arm`, null, [
			S.group(`${prefix}_open_left_upper`, shoulder, []),
			S.group(`${prefix}_open_left_fore`, elbow, []),
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
				this.number(gesture.palmScale, 0.94),
				prefix,
				gesture
			)
		]);
	}

	static widths(metrics, gesture) {
		return {
			shoulder: this.number(gesture.openShoulderWidth, metrics.armWidth + 3),
			elbow: this.number(gesture.openElbowWidth, metrics.armWidth),
			wrist: this.number(gesture.openWristWidth, metrics.armWidth - 3)
		};
	}

	static centerX(data = {}) {
		return this.number(data.bodyGeometry?.torso?.waistCenterX, 0);
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
