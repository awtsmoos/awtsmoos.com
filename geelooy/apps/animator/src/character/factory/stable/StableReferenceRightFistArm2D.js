// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableReferenceLimbPath2D } from './StableReferenceLimbPath2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Chesed folds Ari's right sleeve inward until a warm rounded fist rests near
 * his heart. The Awtsmoos renews every hidden joint, while Awtsmoos.com keeps
 * shoulder, sleeve, knuckles, and fist editable in the production character.
 */
export class StableReferenceRightFistArm2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const shoulder = {
			x: data._skeleton.rightShoulder.x,
			y: data._skeleton.rightShoulder.y + 8
		};
		const elbow = {
			x: shoulder.x + Number(gesture.fistElbowOut || 16),
			y: shoulder.y + Number(gesture.fistElbowDown || 29)
		};
		const wrist = {
			x: Number(gesture.fistX || 23),
			y: metrics.chestY + Number(gesture.fistDrop || 12)
		};
		const sleeve = LineArtStyle.outer(data, colors.jacket);
		return S.group(`${prefix}_right_fist_arm`, null, [
			StableReferenceLimbPath2D.build(
				`${prefix}_right_fist_upper`,
				shoulder,
				elbow,
				metrics.armWidth + 8,
				metrics.armWidth + 5,
				sleeve,
				-3
			),
			StableReferenceLimbPath2D.build(
				`${prefix}_right_fist_fore`,
				elbow,
				wrist,
				metrics.armWidth + 5,
				metrics.armWidth - 1,
				sleeve,
				3
			),
			this.fist(colors, wrist, prefix, Number(gesture.fistScale || 1.22))
		]);
	}

	static fist(colors, wrist, prefix, scale) {
		const centerX = wrist.x - 3.5 * scale;
		const centerY = wrist.y - 6 * scale;
		const mass = G.path(`${prefix}_relaxed_right_fist_mass`, [
			{ type: 'move', x: centerX - 6.5 * scale, y: centerY - 4.5 * scale },
			{ type: 'quad', cx: centerX, cy: centerY - 9 * scale, x: centerX + 7 * scale, y: centerY - 4.5 * scale },
			{ type: 'quad', cx: centerX + 10 * scale, cy: centerY + 0.5 * scale, x: centerX + 5.8 * scale, y: centerY + 7 * scale },
			{ type: 'quad', cx: centerX - 0.5 * scale, cy: centerY + 10 * scale, x: centerX - 7 * scale, y: centerY + 5 * scale },
			{ type: 'quad', cx: centerX - 9.5 * scale, cy: centerY, x: centerX - 6.5 * scale, y: centerY - 4.5 * scale }
		], {
			fill: colors.skin,
			stroke: colors.line,
			lineWidth: 1.45,
			lineJoin: 'round'
		});
		const knuckles = [-2.8, 0.2, 3.2].map((offset, index) => G.path(
			`${prefix}_relaxed_right_knuckle_${index}`,
			[
				{ type: 'move', x: centerX - 2.8 * scale, y: centerY + offset * scale },
				{ type: 'quad', cx: centerX + 0.8 * scale, cy: centerY + (offset - 0.6) * scale, x: centerX + 4.5 * scale, y: centerY + offset * scale }
			],
			{ stroke: colors.skinDark, lineWidth: 0.7, lineCap: 'round' }
		));
		return S.group(`${prefix}_relaxed_right_fist`, null, [mass, ...knuckles]);
	}
}
