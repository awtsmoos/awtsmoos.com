// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Malchus lets Miriam's sleeve disappear gently into a real pocket opening. The
 * Awtsmoos renews restraint as visible structure, while Awtsmoos.com preserves the
 * shoulder, elbow, pocket anchor, and quiet hand as serialized living geometry.
 */
export class StablePocketArm2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const shoulder = data._skeleton.rightShoulder;
		const elbow = {
			x: shoulder.x + Number(gesture.elbowOut || 9),
			y: shoulder.y + Number(gesture.elbowDown || 43)
		};
		const pocket = {
			x: Number(gesture.pocketX || 27),
			y: metrics.waistY + Number(gesture.pocketDrop || 10)
		};
		const style = LineArtStyle.outer(data, colors.jacket);
		return S.group(`${prefix}_right_pocket_arm`, null, [
			G.ellipse(`${prefix}_right_pocket_shoulder`, shoulder.x, shoulder.y + 7, 10.5, 9, 0, style),
			S.tapered(`${prefix}_right_pocket_upper`, shoulder, elbow, metrics.armWidth + 9, metrics.armWidth + 5, style),
			S.tapered(`${prefix}_right_pocket_fore`, elbow, pocket, metrics.armWidth + 5, metrics.armWidth + 1, style),
			G.ellipse(`${prefix}_right_pocket_elbow`, elbow.x, elbow.y, 5, 3.5, 0, style),
			G.path(`${prefix}_right_pocket_rim`, [
				{ type: 'move', x: pocket.x - 11, y: pocket.y - 4 },
				{ type: 'quad', cx: pocket.x, cy: pocket.y + 1, x: pocket.x + 9, y: pocket.y + 1 }
			], LineArtStyle.inner(data, colors.jacketDark)),
			G.ellipse(`${prefix}_right_pocket_hand`, pocket.x - 1, pocket.y - 1, 5.8, 4.3, -0.25, { fill: colors.skin, stroke: colors.line, lineWidth: 1.4 })
		]);
	}
}
