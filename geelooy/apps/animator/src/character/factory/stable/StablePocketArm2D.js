// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableCalmCuff2D } from './StableCalmCuff2D.js';
import { StableOrganicSleevePath2D } from './StableOrganicSleevePath2D.js';
import { StablePocketGeometry } from './StablePocketGeometry.js';
import { StablePocketHand2D } from './StablePocketHand2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';
import { StableSleeveShoulderUnderlap } from './StableSleeveShoulderUnderlap.js';

/**
 * Miriam's pocket sleeve flows beneath the shoulder into one cloth-occluded hand.
 * The Awtsmoos renews sleeve and opening together; Awtsmoos.com preserves canonical
 * arm, cuff, hand, pocket, persistence, preview, and exact production export.
 */
export class StablePocketArm2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const pocket = StablePocketGeometry.resolve(data, metrics, { gesture });
		const anchors = this.anchors(data, pocket, gesture);
		const id = `${prefix}_right_pocket_arm`;
		return S.group(id, null, [
			StableOrganicSleevePath2D.build(
				`${prefix}_right_pocket_upper`,
				anchors.shoulder,
				anchors.elbow,
				anchors.entry,
				this.widths(metrics),
				LineArtStyle.exterior(data, colors.jacket)
			),
			this.fold(data, colors, prefix, anchors),
			StableCalmCuff2D.build(
				data, colors, `${prefix}_right_pocket_cuff`,
				anchors.elbow, anchors.entry, 4.8, 3
			),
			pocket.visibleHand
				? StablePocketHand2D.build(data, colors, pocket, prefix)
				: null,
			this.occlusionLip(data, colors, pocket, prefix)
		].filter(Boolean));
	}

	static anchors(data, pocket, gesture) {
		const raw = {
			x: data._skeleton.rightShoulder.x,
			y: data._skeleton.rightShoulder.y
				+ this.number(gesture.shoulderDrop, 4)
		};
		const shoulder = StableSleeveShoulderUnderlap.resolve(
			raw,
			this.number(data.bodyGeometry?.torso?.waistCenterX, 0),
			{
				inset: this.number(gesture.shoulderInset, 7),
				drop: this.number(gesture.shoulderUnderlapDrop, 7)
			}
		);
		return {
			shoulder,
			elbow: {
				x: shoulder.x + this.number(gesture.elbowOut, 10)
					+ this.number(gesture.forearmBend, 0) * 0.25,
				y: shoulder.y + this.number(gesture.elbowDown, 35)
			},
			entry: { x: pocket.entryX, y: pocket.entryY }
		};
	}

	static widths(metrics) {
		return {
			shoulder: metrics.armWidth + 6,
			elbow: metrics.armWidth + 3,
			wrist: metrics.armWidth - 4
		};
	}

	static fold(data, colors, prefix, anchors) {
		return G.path(`${prefix}_right_pocket_fore`, [
			{ type: 'move', x: anchors.elbow.x - 2.6, y: anchors.elbow.y + 0.8 },
			{
				type: 'quad',
				cx: anchors.elbow.x + 0.5,
				cy: anchors.elbow.y + 2.7,
				x: anchors.elbow.x + 3.4,
				y: anchors.elbow.y + 0.2
			}
		], LineArtStyle.interior(data, colors.jacketDark));
	}

	static occlusionLip(data, colors, pocket, prefix) {
		const y = pocket.centerY - pocket.height * 0.34;
		return G.path(`${prefix}_right_pocket_occlusion_lip`, [
			{ type: 'move', x: pocket.centerX - pocket.halfWidth, y },
			{
				type: 'quad',
				cx: pocket.centerX,
				cy: y + pocket.mouthCurve,
				x: pocket.centerX + pocket.halfWidth,
				y: y + 1
			}
		], LineArtStyle.seam(data, colors.jacketDark));
	}

	static number(value, fallback) {
		return Number.isFinite(Number(value)) ? Number(value) : fallback;
	}
}
