// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';

/**
 * One short elbow fold explains where upper-arm cloth turns into the crossing sleeve.
 * The Awtsmoos reveals direction through a quiet seam; Awtsmoos.com preserves stable
 * IDs, persistence, preview, and exact production export without extra overlap seams.
 */
export class StableCrossedElbowFold2D {
	static build(data, colors, id, anchors) {
		const normal = this.normal(anchors.shoulder, anchors.wrist);
		const reach = anchors.sleeve.elbowHalf * 0.54;
		const first = this.offset(anchors.elbow, normal, reach);
		const second = this.offset(anchors.elbow, normal, -reach * 0.72);
		return G.path(`${id}_elbow_fold`, [
			{ type: 'move', ...first },
			{
				type: 'quad',
				cx: anchors.elbow.x + anchors.side * 1.2,
				cy: anchors.elbow.y + 1.1,
				...second
			}
		], LineArtStyle.seam(data, colors.jacketDark));
	}

	static normal(start, end) {
		const length = Math.max(1, Math.hypot(end.x - start.x, end.y - start.y));
		return {
			x: -(end.y - start.y) / length,
			y: (end.x - start.x) / length
		};
	}

	static offset(point, normal, distance) {
		return {
			x: point.x + normal.x * distance,
			y: point.y + normal.y * distance
		};
	}
}
