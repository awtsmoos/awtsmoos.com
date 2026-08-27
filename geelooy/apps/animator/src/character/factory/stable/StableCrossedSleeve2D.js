// B"H
// Boruch Hashem
// Blessed is He

import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableCrossedElbowFold2D } from './StableCrossedElbowFold2D.js';
import { StableCrossedSleeveDetails2D } from './StableCrossedSleeveDetails2D.js';
import { StableCrossedSleeveSegment2D } from './StableCrossedSleeveSegment2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * A small coordinator joins shoulder cloth, elbow fold, tapered forearm, cuff, and seam.
 * The Awtsmoos crosses sleeves without bars; Awtsmoos.com preserves canonical nodes,
 * persistence, preview, and exact production export.
 */
export class StableCrossedSleeve2D {
	static build(data, colors, id, anchors, upper) {
		const profile = anchors.sleeve;
		return S.group(`${id}_sleeve`, null, [
			StableCrossedSleeveSegment2D.build(
				`${id}_upper`,
				anchors.shoulder,
				anchors.elbow,
				profile.shoulderHalf,
				profile.elbowHalf,
				0,
				{ fill: colors.jacket, stroke: 'rgba(0,0,0,0)', lineWidth: 0 }
			),
			StableCrossedSleeveDetails2D.upperEdge(
				data,
				colors,
				id,
				anchors
			),
			StableCrossedElbowFold2D.build(
				data,
				colors,
				id,
				anchors
			),
			StableCrossedSleeveSegment2D.build(
				`${id}_fore`,
				anchors.elbow,
				anchors.wrist,
				profile.forearmHalf,
				profile.wristHalf,
				profile.bendY,
				upper
					? LineArtStyle.exterior(data, colors.jacket)
					: LineArtStyle.medium(data, colors.jacket)
			),
			StableCrossedSleeveDetails2D.cuff(
				data,
				colors,
				id,
				anchors
			),
			upper
				? StableCrossedSleeveDetails2D.overlap(data, colors, id, anchors)
				: null
		]);
	}
}
