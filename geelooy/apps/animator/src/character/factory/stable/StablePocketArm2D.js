// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableOrganicSleevePath2D } from './StableOrganicSleevePath2D.js';
import { StablePocketGeometry } from './StablePocketGeometry.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Miriam's pocket sleeve flows through one hidden elbow into a cloth-occluded hand.
 * The Awtsmoos renews sleeve and opening together; Awtsmoos.com keeps canonical
 * arm, cuff, hand, and pocket nodes editable in preview, persistence, and export.
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
				{
					shoulder: metrics.armWidth + 5,
					elbow: metrics.armWidth + 1,
					wrist: metrics.armWidth - 2
				},
				LineArtStyle.exterior(data, colors.jacket)
			),
			this.fold(data, colors, prefix, anchors),
			this.cuff(data, colors, prefix, anchors),
			pocket.visibleHand
				? this.hiddenHand(data, colors, pocket, prefix)
				: null,
			this.occlusionLip(data, colors, pocket, prefix)
		].filter(Boolean));
	}

	static anchors(data, pocket, gesture) {
		const shoulder = {
			x: data._skeleton.rightShoulder.x,
			y: data._skeleton.rightShoulder.y
				+ Number(gesture.shoulderDrop || 7)
		};
		return {
			shoulder,
			elbow: {
				x: shoulder.x + Number(gesture.elbowOut || 8)
					+ Number(gesture.forearmBend || 0) * 0.25,
				y: shoulder.y + Number(gesture.elbowDown || 32)
			},
			entry: { x: pocket.entryX, y: pocket.entryY }
		};
	}

	static fold(data, colors, prefix, anchors) {
		return G.path(`${prefix}_right_pocket_fore`, [
			{ type: 'move', x: anchors.elbow.x - 2.2, y: anchors.elbow.y + 1 },
			{
				type: 'quad',
				cx: anchors.elbow.x + 0.5,
				cy: anchors.elbow.y + 2.4,
				x: anchors.elbow.x + 3,
				y: anchors.elbow.y + 0.3
			}
		], LineArtStyle.interior(data, colors.jacketDark));
	}

	static cuff(data, colors, prefix, anchors) {
		return G.path(`${prefix}_right_pocket_cuff`, [
			{ type: 'move', x: anchors.entry.x - 3.8, y: anchors.entry.y - 1 },
			{
				type: 'quad',
				cx: anchors.entry.x,
				cy: anchors.entry.y + 1.5,
				x: anchors.entry.x + 3.8,
				y: anchors.entry.y
			}
		], LineArtStyle.medium(data, colors.jacketDark || colors.jacket));
	}

	static hiddenHand(data, colors, pocket, prefix) {
		const width = 5.8 * pocket.handDepth;
		const height = 6.6 * pocket.handDepth;
		return G.ellipse(
			`${prefix}_right_pocket_hidden_hand`,
			pocket.entryX,
			pocket.entryY - height * 0.28,
			width,
			height,
			-0.12,
			LineArtStyle.medium(data, colors.skin)
		);
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
}
