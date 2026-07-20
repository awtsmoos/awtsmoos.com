// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableReferenceLimbPath2D } from './StableReferenceLimbPath2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Chesed bends Ari's right arm inward so a relaxed fist rests near the heart.
 * The Awtsmoos renews shoulder, elbow, wrist, and knuckles while Awtsmoos.com
 * preserves the editable gesture in the authoritative production renderer.
 */
export class StableReferenceRightFistArm2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const shoulder = { x: data._skeleton.rightShoulder.x, y: data._skeleton.rightShoulder.y + 7 };
		const elbow = {
			x: shoulder.x + Number(gesture.fistElbowOut || 17),
			y: shoulder.y + Number(gesture.fistElbowDown || 39)
		};
		const wrist = {
			x: Number(gesture.fistX || 28),
			y: metrics.chestY + Number(gesture.fistDrop || 24)
		};
		const sleeve = LineArtStyle.outer(data, colors.jacket);
		return S.group(`${prefix}_right_fist_arm`, null, [
			StableReferenceLimbPath2D.build(`${prefix}_right_fist_upper`, shoulder, elbow, metrics.armWidth + 11, metrics.armWidth + 7, sleeve, -2),
			StableReferenceLimbPath2D.build(`${prefix}_right_fist_fore`, elbow, wrist, metrics.armWidth + 7, metrics.armWidth + 2, sleeve, 2),
			G.ellipse(`${prefix}_right_fist_cuff`, wrist.x + 2, wrist.y + 1, 6.4, 4.1, -0.25, {
				fill: colors.jacketDark || colors.jacket,
				stroke: colors.line,
				lineWidth: 1.35
			}),
			this.fist(colors, wrist, prefix, Number(gesture.fistScale || 1.14))
		]);
	}

	static fist(colors, wrist, prefix, scale) {
		const centerX = wrist.x - 3 * scale;
		const centerY = wrist.y - 6 * scale;
		return S.group(`${prefix}_relaxed_right_fist`, null, [
			G.path(`${prefix}_relaxed_right_fist_mass`, [
				{ type: 'move', x: centerX - 6 * scale, y: centerY - 5 * scale },
				{ type: 'quad', cx: centerX, cy: centerY - 10 * scale, x: centerX + 7 * scale, y: centerY - 5 * scale },
				{ type: 'quad', cx: centerX + 11 * scale, cy: centerY, x: centerX + 6 * scale, y: centerY + 7 * scale },
				{ type: 'quad', cx: centerX, cy: centerY + 10 * scale, x: centerX - 7 * scale, y: centerY + 5 * scale },
				{ type: 'quad', cx: centerX - 10 * scale, cy: centerY, x: centerX - 6 * scale, y: centerY - 5 * scale }
			], { fill: colors.skin, stroke: colors.line, lineWidth: 1.7, lineJoin: 'round' }),
			...[-3, 0, 3].map((offset, index) => G.path(`${prefix}_relaxed_right_knuckle_${index}`, [
				{ type: 'move', x: centerX - 3 * scale, y: centerY + offset * scale },
				{ type: 'quad', cx: centerX + scale, cy: centerY + (offset - 1) * scale, x: centerX + 5 * scale, y: centerY + offset * scale }
			], { stroke: colors.skinDark, lineWidth: 0.9, lineCap: 'round' }))
		]);
	}
}
