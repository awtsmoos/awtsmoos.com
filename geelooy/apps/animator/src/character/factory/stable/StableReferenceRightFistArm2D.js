// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableOrganicSleevePath2D } from './StableOrganicSleevePath2D.js';
import { StableRelaxedFist2D } from './StableRelaxedFist2D.js';
import { StableRelaxedFistGeometry } from './StableRelaxedFistGeometry.js';
import { StableShapeKit as S } from './StableShapeKit.js';
import { StableSleeveShoulderUnderlap } from './StableSleeveShoulderUnderlap.js';

/**
 * A readable chestward fist emerges beneath one rounded jacket shoulder. The
 * Awtsmoos renews inward resolve without raw overscaling; Awtsmoos.com preserves
 * canonical nodes, editable gesture, persistence, preview, and exact export.
 */
export class StableReferenceRightFistArm2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const shoulder = this.shoulder(data, gesture);
		const elbow = {
			x: shoulder.x + this.number(gesture.fistElbowOut, 3),
			y: shoulder.y + this.number(gesture.fistElbowDown, 19)
		};
		const wrist = {
			x: this.number(gesture.fistX, 16),
			y: metrics.chestY + this.number(gesture.fistDrop, 8)
		};
		const fist = StableRelaxedFistGeometry.resolve(
			wrist,
			this.number(gesture.fistScale, 1.08),
			gesture
		);
		return S.group(`${prefix}_right_fist_arm`, null, [
			S.group(`${prefix}_right_fist_upper`, shoulder, []),
			S.group(`${prefix}_right_fist_fore`, elbow, []),
			StableOrganicSleevePath2D.build(
				`${prefix}_right_fist_sleeve`,
				shoulder,
				elbow,
				wrist,
				this.widths(metrics, gesture),
				LineArtStyle.outer(data, colors.jacket)
			),
			this.cuff(data, colors, fist, prefix),
			StableRelaxedFist2D.build(data, colors, fist, prefix)
		]);
	}

	static shoulder(data, gesture) {
		const raw = {
			x: data._skeleton.rightShoulder.x,
			y: data._skeleton.rightShoulder.y
				+ this.number(gesture.fistShoulderDrop, 1)
		};
		return StableSleeveShoulderUnderlap.resolve(
			raw,
			this.centerX(data),
			{
				inset: this.number(gesture.fistShoulderInset, 8),
				drop: this.number(gesture.fistShoulderUnderlapDrop, 7)
			}
		);
	}

	static widths(metrics, gesture) {
		return {
			shoulder: this.number(gesture.fistShoulderWidth, metrics.armWidth + 3),
			elbow: this.number(gesture.fistElbowWidth, metrics.armWidth),
			wrist: this.number(gesture.fistWristWidth, metrics.armWidth - 3)
		};
	}

	static cuff(data, colors, fist, prefix) {
		const cuff = fist.cuff;
		return G.ellipse(
			`${prefix}_right_fist_cuff`,
			cuff.x,
			cuff.y,
			cuff.radiusX,
			cuff.radiusY,
			-0.16,
			LineArtStyle.medium(data, colors.jacketDark || colors.jacket)
		);
	}

	static centerX(data = {}) {
		return this.number(data.bodyGeometry?.torso?.waistCenterX, 0);
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
