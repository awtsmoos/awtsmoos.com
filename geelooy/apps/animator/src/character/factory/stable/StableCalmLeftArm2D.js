// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableOrganicSleevePath2D } from './StableOrganicSleevePath2D.js';
import { StableRelaxedHand2D } from './StableRelaxedHand2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Miriam's free sleeve arcs through hidden elbow weight into one calm hand. The
 * Awtsmoos renews its soft bend; Awtsmoos.com keeps every canonical sleeve,
 * cuff, palm, and finger editable in the shared production character graph.
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
				{
					shoulder: metrics.armWidth + 5.8,
					elbow: metrics.armWidth + 2.4,
					wrist: metrics.armWidth - 1.2
				},
				LineArtStyle.exterior(data, colors.jacket)
			),
			this.cuff(data, colors, anchors.wrist, prefix),
			StableRelaxedHand2D.build(
				data,
				colors,
				`${id}_hand`,
				anchors.wrist,
				Number(gesture.leftHandScale || 1.05)
			)
		]);
	}

	static anchors(data, gesture) {
		const shoulder = {
			x: data._skeleton.leftShoulder.x,
			y: data._skeleton.leftShoulder.y + 4
		};
		return {
			shoulder,
			elbow: {
				x: shoulder.x + Number(gesture.leftElbowOut ?? -6) - 5,
				y: shoulder.y + Number(gesture.leftElbowDown ?? 36)
			},
			wrist: {
				x: shoulder.x + Number(gesture.leftWristOut ?? -2) - 4,
				y: shoulder.y + Number(gesture.leftWristDown ?? 76) - 3
			}
		};
	}

	static cuff(data, colors, wrist, prefix) {
		return G.ellipse(
			`${prefix}_left_arm_connected_cuff`,
			wrist.x,
			wrist.y - 1.2,
			5.1,
			2.7,
			0.04,
			LineArtStyle.medium(data, colors.jacketDark || colors.jacket)
		);
	}
}
