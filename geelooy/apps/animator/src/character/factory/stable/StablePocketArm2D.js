// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableReferenceLimbPath2D } from './StableReferenceLimbPath2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Malchus lets Miriam's right sleeve curve naturally into a true pocket opening.
 * The Awtsmoos renews shoulder, elbow, forearm, and hidden hand while Awtsmoos.com
 * preserves every anchor as serializable, keyframeable production geometry.
 */
export class StablePocketArm2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const shoulder = { x: data._skeleton.rightShoulder.x, y: data._skeleton.rightShoulder.y + 7 };
		const elbow = {
			x: shoulder.x + Number(gesture.elbowOut || 14),
			y: shoulder.y + Number(gesture.elbowDown || 39)
		};
		const pocket = {
			x: Number(gesture.pocketX || 25),
			y: metrics.waistY + Number(gesture.pocketDrop || 8)
		};
		const sleeve = LineArtStyle.outer(data, colors.jacket);
		return S.group(`${prefix}_right_pocket_arm`, null, [
			StableReferenceLimbPath2D.build(`${prefix}_right_pocket_upper`, shoulder, elbow, metrics.armWidth + 9, metrics.armWidth + 6, sleeve, -2),
			StableReferenceLimbPath2D.build(`${prefix}_right_pocket_fore`, elbow, pocket, metrics.armWidth + 6, metrics.armWidth + 1, sleeve, 3),
			G.ellipse(`${prefix}_right_pocket_cuff`, pocket.x - 3, pocket.y - 1, 5.7, 3.6, -0.22, {
				fill: colors.jacketDark || colors.jacket,
				stroke: colors.line,
				lineWidth: 1.2
			}),
			this.pocketOpening(data, colors, pocket, prefix),
			this.hiddenHand(colors, pocket, prefix)
		]);
	}

	static pocketOpening(data, colors, pocket, prefix) {
		return G.path(`${prefix}_right_pocket_rim`, [
			{ type: 'move', x: pocket.x - 12, y: pocket.y - 5 },
			{ type: 'quad', cx: pocket.x, cy: pocket.y + 1, x: pocket.x + 11, y: pocket.y - 1 }
		], { ...LineArtStyle.inner(data, colors.jacketDark), lineWidth: 1.8, lineCap: 'round' });
	}

	static hiddenHand(colors, pocket, prefix) {
		return G.path(`${prefix}_right_pocket_hidden_hand`, [
			{ type: 'move', x: pocket.x - 7, y: pocket.y - 4 },
			{ type: 'quad', cx: pocket.x - 2, cy: pocket.y - 8, x: pocket.x + 4, y: pocket.y - 4 },
			{ type: 'quad', cx: pocket.x + 2, cy: pocket.y, x: pocket.x - 4, y: pocket.y },
			{ type: 'quad', cx: pocket.x - 8, cy: pocket.y - 1, x: pocket.x - 7, y: pocket.y - 4 }
		], { fill: colors.skin, stroke: colors.line, lineWidth: 1.25, lineJoin: 'round' });
	}
}
