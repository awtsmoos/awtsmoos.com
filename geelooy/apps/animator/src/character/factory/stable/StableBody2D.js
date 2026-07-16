// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableShapeKit as S } from './StableShapeKit.js';
import { StableSkirt2D } from './StableSkirt2D.js';
import { StableTorsoDetails2D } from './StableTorsoDetails2D.js';

/**
 * The Awtsmoos joins torso, collar, shirt, pelvis, and skirt to one skeleton.
 * Awtsmoos.com therefore animates clothing as living geometry, never as a crop.
 */
export class StableBody2D {
	static human(data, colors, metrics) {
		return S.group('human_body_connected', null, [
			this.neck(data, colors, metrics),
			this.torso(data, colors, metrics),
			StableTorsoDetails2D.lapels(data, colors, metrics),
			StableTorsoDetails2D.fabric(data, colors, metrics),
			data.skirt
				? StableSkirt2D.build(data, colors, metrics)
				: this.pelvis(data, colors, metrics),
			StableTorsoDetails2D.collar(data, colors, metrics)
		]);
	}

	static sage(data, colors, metrics) {
		return S.group('sage_body_connected', null, [
			this.neck(data, colors, metrics),
			this.robe(data, colors, metrics),
			this.robeFolds(data, colors, metrics),
			StableTorsoDetails2D.collar(data, colors, metrics)
		]);
	}

	static neck(data, colors, metrics) {
		const skeleton = data._skeleton;
		return S.poly('neck_connected', [
			[skeleton.neck.x - 7, metrics.neckBottomY],
			[skeleton.neck.x + 7, metrics.neckBottomY],
			[skeleton.neck.x + 6, metrics.neckTopY],
			[skeleton.neck.x - 6, metrics.neckTopY]
		], LineArtStyle.outer(data, colors.skin));
	}

	static torso(data, colors, metrics) {
		const skeleton = data._skeleton;
		return G.path('jacket_connected_mass', [
			{ type: 'move', x: skeleton.leftShoulder.x, y: metrics.shoulderY },
			{ type: 'quad', cx: skeleton.chest.x, cy: metrics.shoulderY - 12, x: skeleton.rightShoulder.x, y: metrics.shoulderY },
			{ type: 'line', x: skeleton.rightHip.x + 18, y: metrics.hipY + 3 },
			{ type: 'quad', cx: skeleton.hips.x, cy: metrics.hipY + 17, x: skeleton.leftHip.x - 18, y: metrics.hipY + 3 },
			{ type: 'line', x: skeleton.leftShoulder.x, y: metrics.shoulderY }
		], LineArtStyle.outer(data, colors.jacket));
	}

	static robe(data, colors, metrics) {
		const skeleton = data._skeleton;
		return G.path('robe_connected_mass', [
			{ type: 'move', x: skeleton.leftShoulder.x - 4, y: metrics.shoulderY },
			{ type: 'quad', cx: skeleton.chest.x, cy: metrics.shoulderY - 10, x: skeleton.rightShoulder.x + 4, y: metrics.shoulderY },
			{ type: 'line', x: skeleton.rightHip.x + 28, y: metrics.robeBottomY },
			{ type: 'quad', cx: skeleton.hips.x, cy: metrics.robeBottomY + 18, x: skeleton.leftHip.x - 28, y: metrics.robeBottomY },
			{ type: 'line', x: skeleton.leftShoulder.x - 4, y: metrics.shoulderY }
		], LineArtStyle.outer(data, colors.robe));
	}

	static robeFolds(data, colors, metrics) {
		const skeleton = data._skeleton;
		return S.group('robe_folds', null, [-22, -10, 7, 19].map((offset, index) => (
			G.path(`robe_fold_${index}`, [
				{ type: 'move', x: skeleton.chest.x + offset, y: metrics.chestY + 15 },
				{ type: 'quad', cx: skeleton.chest.x + offset * 0.6, cy: metrics.waistY + 26, x: skeleton.chest.x + offset * 0.9, y: metrics.robeBottomY - 8 }
			], { stroke: 'rgba(0,0,0,.18)', lineWidth: 1.2, lineCap: 'round' })
		)));
	}

	static pelvis(data, colors, metrics) {
		const skeleton = data._skeleton;
		return S.group('pelvis_layer', null, [
			G.path('pelvis_connected', [
				{ type: 'move', x: skeleton.leftHip.x - 16, y: metrics.hipY - 9 },
				{ type: 'quad', cx: skeleton.hips.x, cy: metrics.hipY - 18, x: skeleton.rightHip.x + 16, y: metrics.hipY - 9 },
				{ type: 'line', x: skeleton.rightHip.x + 9, y: metrics.hipY + 16 },
				{ type: 'quad', cx: skeleton.hips.x, cy: metrics.hipY + 25, x: skeleton.leftHip.x - 9, y: metrics.hipY + 16 },
				{ type: 'line', x: skeleton.leftHip.x - 16, y: metrics.hipY - 9 }
			], LineArtStyle.outer(data, colors.pants)),
			G.path('waist_seam', [
				{ type: 'move', x: skeleton.leftHip.x - 18, y: metrics.hipY - 7 },
				{ type: 'quad', cx: skeleton.hips.x, cy: metrics.hipY - 2, x: skeleton.rightHip.x + 18, y: metrics.hipY - 7 }
			], { stroke: 'rgba(0,0,0,.32)', lineWidth: 1.4, lineCap: 'round' })
		]);
	}
}
