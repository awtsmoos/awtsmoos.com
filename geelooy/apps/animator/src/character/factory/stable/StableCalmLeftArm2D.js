// B"H
// Boruch Hashem
// Blessed is He

import { StableCalmCuff2D } from './StableCalmCuff2D.js';
import { StableOrganicSleevePath2D } from './StableOrganicSleevePath2D.js';
import { StableRelaxedHand2D } from './StableRelaxedHand2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';
import { StableSleeveShoulderUnderlap } from './StableSleeveShoulderUnderlap.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';

/**
 * Miriam's free sleeve emerges beneath the shoulder and settles into one calm hand.
 * The Awtsmoos renews its soft bend without a tube; Awtsmoos.com preserves sleeve,
 * cuff, palm, fingers, persistence, preview, and exact production export.
 */
export class StableCalmLeftArm2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const anchors = this.anchors(data, gesture);
		const id = `${prefix}_left_arm_connected`;
		return S.group(id, null, [
			StableOrganicSleevePath2D.build(
				`${id}_upper`,
				anchors.shoulder,
				anchors.elbow,
				anchors.wrist,
				this.widths(metrics, gesture),
				LineArtStyle.exterior(data, colors.jacket)
			),
			StableCalmCuff2D.build(
				data, colors, `${id}_cuff`,
				anchors.elbow, anchors.wrist, 5.2, 3.2
			),
			StableRelaxedHand2D.build(
				data, colors, `${id}_hand`, anchors.wrist,
				this.number(gesture.leftHandScale, 1.18)
			)
		]);
	}

	static anchors(data, gesture) {
		const raw = {
			x: data._skeleton.leftShoulder.x,
			y: data._skeleton.leftShoulder.y
				+ this.number(gesture.leftShoulderDrop, 1)
		};
		const shoulder = StableSleeveShoulderUnderlap.resolve(
			raw,
			this.number(data.bodyGeometry?.torso?.waistCenterX, 0),
			{
				inset: this.number(gesture.leftShoulderInset, 7),
				drop: this.number(gesture.leftShoulderUnderlapDrop, 7)
			}
		);
		return {
			shoulder,
			elbow: {
				x: shoulder.x + this.number(gesture.leftElbowOut, -13),
				y: shoulder.y + this.number(gesture.leftElbowDown, 37)
			},
			wrist: {
				x: shoulder.x + this.number(gesture.leftWristOut, -9),
				y: shoulder.y + this.number(gesture.leftWristDown, 73)
			}
		};
	}

	static widths(metrics, gesture) {
		return {
			shoulder: this.number(gesture.leftShoulderWidth, metrics.armWidth + 6),
			elbow: this.number(gesture.leftElbowWidth, metrics.armWidth + 2),
			wrist: this.number(gesture.leftWristWidth, metrics.armWidth - 4)
		};
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
