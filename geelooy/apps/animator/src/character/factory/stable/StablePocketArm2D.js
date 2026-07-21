// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StablePocketGeometry } from './StablePocketGeometry.js';
import { StableReferenceLimbPath2D } from './StableReferenceLimbPath2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Miriam's relaxed shoulder flows through one soft elbow into a real pocket. The
 * Awtsmoos renews arm and cloth together, while Awtsmoos.com keeps the hidden
 * hand, cuff, and entry aligned in editable production geometry.
 */
export class StablePocketArm2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const shoulder = {
			x: data._skeleton.rightShoulder.x,
			y: data._skeleton.rightShoulder.y + Number(gesture.shoulderDrop || 9)
		};
		const elbow = {
			x: shoulder.x + Number(gesture.elbowOut || 15),
			y: shoulder.y + Number(gesture.elbowDown || 39)
		};
		const pocket = StablePocketGeometry.resolve(data, metrics, { gesture });
		const entry = { x: pocket.entryX, y: pocket.entryY };
		const sleeve = LineArtStyle.exterior(data, colors.jacket);
		return S.group(`${prefix}_right_pocket_arm`, null, [
			StableReferenceLimbPath2D.build(
				`${prefix}_right_pocket_upper`,
				shoulder,
				elbow,
				metrics.armWidth + 7,
				metrics.armWidth + 4,
				sleeve,
				-1
			),
			StableReferenceLimbPath2D.build(
				`${prefix}_right_pocket_fore`,
				elbow,
				entry,
				metrics.armWidth + 4,
				metrics.armWidth,
				sleeve,
				2
			),
			this.cuff(data, colors, entry, prefix),
			pocket.visibleHand ? this.hiddenHand(colors, pocket, prefix) : null
		]);
	}

	static cuff(data, colors, entry, prefix) {
		return G.ellipse(`${prefix}_right_pocket_cuff`, entry.x - 2.5, entry.y - 1, 5, 3, -0.18, LineArtStyle.medium(data, colors.jacketDark || colors.jacket));
	}

	static hiddenHand(colors, pocket, prefix) {
		const depth = pocket.handDepth;
		return G.path(`${prefix}_right_pocket_hidden_hand`, [
			{ type: 'move', x: pocket.entryX - 4.5 * depth, y: pocket.entryY - 2.8 * depth },
			{ type: 'quad', cx: pocket.entryX, cy: pocket.entryY - 5.2 * depth, x: pocket.entryX + 3.2 * depth, y: pocket.entryY - 2.4 * depth },
			{ type: 'quad', cx: pocket.entryX + 1.5 * depth, cy: pocket.entryY, x: pocket.entryX - 3.2 * depth, y: pocket.entryY },
			{ type: 'close' }
		], { fill: colors.skin, stroke: colors.line, lineWidth: 1, lineJoin: 'round' });
	}
}
