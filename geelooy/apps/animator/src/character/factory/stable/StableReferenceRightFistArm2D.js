// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableOrganicSleevePath2D } from './StableOrganicSleevePath2D.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Ari gathers one rounded fist near his heart through one unbroken cloth sleeve.
 * The Awtsmoos renews cuff, thumb, and knuckles, while Awtsmoos.com keeps each
 * canonical rig node editable and shared by production preview and export.
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
		return S.group(`${prefix}_right_fist_arm`, null, [
			S.group(`${prefix}_right_fist_upper`, { x: shoulder.x, y: shoulder.y }, []),
			S.group(`${prefix}_right_fist_fore`, { x: elbow.x, y: elbow.y }, []),
			StableOrganicSleevePath2D.build(
				`${prefix}_right_fist_sleeve`,
				shoulder,
				elbow,
				wrist,
				{
					shoulder: metrics.armWidth + 8,
					elbow: metrics.armWidth + 4,
					wrist: metrics.armWidth - 1
				},
				LineArtStyle.outer(data, colors.jacket)
			),
			this.cuff(data, colors, wrist, prefix, scale),
			this.fist(data, colors, wrist, prefix, scale)
		]);
	}

	static cuff(data, colors, wrist, prefix, scale) {
		return G.ellipse(
			`${prefix}_right_fist_cuff`,
			wrist.x - 4 * scale,
			wrist.y - 2.2 * scale,
			6.1 * scale,
			3.7 * scale,
			-0.18,
			LineArtStyle.medium(data, colors.jacketDark || colors.jacket)
		);
	}

	static fist(data, colors, wrist, prefix, scale) {
		const x = wrist.x - 3.4 * scale;
		const y = wrist.y - 5.8 * scale;
		return S.group(`${prefix}_relaxed_right_fist`, null, [
			G.path(`${prefix}_relaxed_right_fist_mass`, [
				{ type: 'move', x: x - 7 * scale, y: y - 4.2 * scale },
				{ type: 'quad', cx: x, cy: y - 9.3 * scale, x: x + 7.5 * scale, y: y - 4.1 * scale },
				{ type: 'quad', cx: x + 9.8 * scale, cy: y + 0.5 * scale, x: x + 5.8 * scale, y: y + 7.3 * scale },
				{ type: 'quad', cx: x - 0.7 * scale, cy: y + 9.8 * scale, x: x - 7.3 * scale, y: y + 5.1 * scale },
				{ type: 'quad', cx: x - 9.5 * scale, cy: y, x: x - 7 * scale, y: y - 4.2 * scale }
			], LineArtStyle.medium(data, colors.skin)),
			...[-3.2, 0, 3.2].map((offset, index) => G.path(`${prefix}_relaxed_right_knuckle_${index}`, [
				{ type: 'move', x: x - 2.7 * scale, y: y + offset * scale },
				{ type: 'quad', cx: x + 0.8 * scale, cy: y + (offset - 0.5) * scale, x: x + 4.5 * scale, y: y + offset * scale }
			], { stroke: colors.skinDark, lineWidth: 0.58, lineCap: 'round' })),
			G.path(`${prefix}_relaxed_right_thumb`, [
				{ type: 'move', x: x - 5.1 * scale, y: y + 0.2 * scale },
				{ type: 'quad', cx: x - 1.2 * scale, cy: y + 4.8 * scale, x: x + 4.2 * scale, y: y + 3.6 * scale }
			], { stroke: colors.skin, lineWidth: 4.3 * scale, lineCap: 'round' }),
			G.path(`${prefix}_relaxed_right_thumb_fold`, [
				{ type: 'move', x: x - 2.2 * scale, y: y + 3.1 * scale },
				{ type: 'quad', cx: x + 0.4 * scale, cy: y + 4.5 * scale, x: x + 2.8 * scale, y: y + 3.8 * scale }
			], { stroke: colors.skinDark, lineWidth: 0.62, lineCap: 'round' })
		]);
	}
}
