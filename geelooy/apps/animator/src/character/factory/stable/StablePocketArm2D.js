// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StablePocketGeometry } from './StablePocketGeometry.js';
import { StableReferenceLimbPath2D } from './StableReferenceLimbPath2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Miriam's relaxed shoulder descends through soft cloth into a real pocket mouth.
 * The Awtsmoos renews hidden hand and visible sleeve together, while Awtsmoos.com
 * preserves one editable, deterministic pocket-arm composition.
 */
export class StablePocketArm2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const shoulder = {
			x: data._skeleton.rightShoulder.x,
			y: data._skeleton.rightShoulder.y + Number(gesture.shoulderDrop || 9)
		};
		const elbow = {
			x: shoulder.x + Number(gesture.elbowOut || 12),
			y: shoulder.y + Number(gesture.elbowDown || 38)
		};
		const pocket = StablePocketGeometry.resolve(data, metrics, { gesture });
		const entry = { x: pocket.entryX, y: pocket.entryY };
		const sleeve = LineArtStyle.exterior(data, colors.jacket);
		return S.group(`${prefix}_right_pocket_arm`, null, [
			StableReferenceLimbPath2D.build(
				`${prefix}_right_pocket_upper`,
				shoulder,
				elbow,
				metrics.armWidth + 6,
				metrics.armWidth + 3,
				sleeve,
				-2
			),
			StableReferenceLimbPath2D.build(
				`${prefix}_right_pocket_fore`,
				elbow,
				entry,
				metrics.armWidth + 3,
				metrics.armWidth - 1,
				sleeve,
				Number(gesture.forearmBend || 4)
			),
			this.cuff(data, colors, entry, prefix),
			pocket.visibleHand ? this.hiddenHand(data, colors, pocket, prefix) : null
		]);
	}

	static cuff(data, colors, entry, prefix) {
		return G.path(`${prefix}_right_pocket_cuff`, [
			{ type: 'move', x: entry.x - 5, y: entry.y - 2 },
			{ type: 'quad', cx: entry.x, cy: entry.y - 4, x: entry.x + 4, y: entry.y - 1 },
			{ type: 'quad', cx: entry.x, cy: entry.y + 1, x: entry.x - 5, y: entry.y - 2 }
		], LineArtStyle.medium(data, colors.jacketDark || colors.jacket));
	}

	static hiddenHand(data, colors, pocket, prefix) {
		const depth = pocket.handDepth;
		return G.path(`${prefix}_right_pocket_hidden_hand`, [
			{ type: 'move', x: pocket.entryX - 4 * depth, y: pocket.entryY - 2.4 * depth },
			{ type: 'quad', cx: pocket.entryX, cy: pocket.entryY - 4.4 * depth, x: pocket.entryX + 3 * depth, y: pocket.entryY - 2 * depth },
			{ type: 'quad', cx: pocket.entryX + 1.2 * depth, cy: pocket.entryY, x: pocket.entryX - 3 * depth, y: pocket.entryY },
			{ type: 'close' }
		], LineArtStyle.medium(data, colors.skin));
	}
}
