// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableReferenceLimbPath2D } from './StableReferenceLimbPath2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Ari gathers one rounded fist near his heart through a soft cloth elbow. The
 * Awtsmoos renews sleeve, cuff, thumb, and knuckles, while Awtsmoos.com keeps
 * every canonical node editable and shared by preview and export.
 */
export class StableReferenceRightFistArm2D {
	static build(data, colors, metrics, prefix, gesture = {}) {
		const shoulder = {
			x: data._skeleton.rightShoulder.x,
			y: data._skeleton.rightShoulder.y + 7
		};
		const elbow = {
			x: shoulder.x + Number(gesture.fistElbowOut || 17),
			y: shoulder.y + Number(gesture.fistElbowDown || 31)
		};
		const wrist = {
			x: Number(gesture.fistX || 49),
			y: metrics.chestY + Number(gesture.fistDrop || 23)
		};
		const scale = Number(gesture.fistScale || 1.16);
		const sleeve = LineArtStyle.exterior(data, colors.jacket);
		return S.group(`${prefix}_right_fist_arm`, null, [
			StableReferenceLimbPath2D.build(`${prefix}_right_fist_upper`, shoulder, elbow, metrics.armWidth + 7, metrics.armWidth + 4, sleeve, -4),
			StableReferenceLimbPath2D.build(`${prefix}_right_fist_fore`, elbow, wrist, metrics.armWidth + 4, metrics.armWidth - 1, sleeve, 4),
			this.cuff(data, colors, wrist, prefix, scale),
			this.fist(data, colors, wrist, prefix, scale)
		]);
	}

	static cuff(data, colors, wrist, prefix, scale) {
		return G.ellipse(
			`${prefix}_right_fist_cuff`,
			wrist.x - 4.2 * scale,
			wrist.y - 2.3 * scale,
			6.2 * scale,
			3.8 * scale,
			-0.18,
			LineArtStyle.medium(data, colors.jacketDark || colors.jacket)
		);
	}

	static fist(data, colors, wrist, prefix, scale) {
		const x = wrist.x - 3.4 * scale;
		const y = wrist.y - 5.8 * scale;
		return S.group(`${prefix}_relaxed_right_fist`, null, [
			G.path(`${prefix}_relaxed_right_fist_mass`, [
				{ type: 'move', x: x - 6.8 * scale, y: y - 4.4 * scale },
				{ type: 'quad', cx: x, cy: y - 9 * scale, x: x + 7.2 * scale, y: y - 4.3 * scale },
				{ type: 'quad', cx: x + 9.6 * scale, cy: y + 0.3 * scale, x: x + 5.8 * scale, y: y + 7 * scale },
				{ type: 'quad', cx: x - 0.6 * scale, cy: y + 9.5 * scale, x: x - 7.1 * scale, y: y + 5 * scale },
				{ type: 'quad', cx: x - 9.2 * scale, cy: y, x: x - 6.8 * scale, y: y - 4.4 * scale }
			], LineArtStyle.medium(data, colors.skin)),
			...[-3.2, 0, 3.2].map((offset, index) => G.path(`${prefix}_relaxed_right_knuckle_${index}`, [
				{ type: 'move', x: x - 2.7 * scale, y: y + offset * scale },
				{ type: 'quad', cx: x + 0.8 * scale, cy: y + (offset - 0.6) * scale, x: x + 4.6 * scale, y: y + offset * scale }
			], { stroke: colors.skinDark, lineWidth: 0.62, lineCap: 'round' })),
			G.path(`${prefix}_relaxed_right_thumb`, [
				{ type: 'move', x: x - 5.1 * scale, y: y + 0.4 * scale },
				{ type: 'quad', cx: x - 1.3 * scale, cy: y + 4.8 * scale, x: x + 4.1 * scale, y: y + 3.7 * scale }
			], { stroke: colors.skin, lineWidth: 4.2 * scale, lineCap: 'round' })
		]);
	}
}
