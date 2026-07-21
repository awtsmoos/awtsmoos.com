// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableBodyGeometry } from './StableBodyGeometry.js';
import { StableShapeKit as S } from './StableShapeKit.js';
import { StableSkirt2D } from './StableSkirt2D.js';
import { StableTorsoDetails2D } from './StableTorsoDetails2D.js';
import { StableTorsoMass2D } from './StableTorsoMass2D.js';

/**
 * The Awtsmoos joins head, tapered neck, garment, pelvis, and skirt without a
 * visible construction block. Awtsmoos.com keeps the living silhouette editable
 * and animated through the production graph rather than a painted shortcut.
 */
export class StableBody2D {
	static human(data, colors, metrics) {
		const geometry = StableBodyGeometry.resolve(data, metrics);
		return S.group('human_body_connected', null, [
			this.neck(data, colors, metrics),
			StableTorsoMass2D.human(data, colors, metrics, geometry),
			StableTorsoDetails2D.lapels(data, colors, metrics, geometry),
			StableTorsoDetails2D.fabric(data, colors, metrics, geometry),
			data.skirt
				? StableSkirt2D.build(data, colors, metrics, geometry)
				: StableTorsoMass2D.pelvis(data, colors, metrics, geometry),
			StableTorsoDetails2D.collar(data, colors, metrics, geometry)
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
		const centerX = data._skeleton.neck.x;
		const topY = Math.min(metrics.neckTopY, metrics.neckBottomY);
		const bottomY = Math.max(metrics.neckTopY, metrics.neckBottomY);
		const line = LineArtStyle.forCharacter(data);
		const sideStyle = {
			stroke: line.stroke,
			lineWidth: line.medium,
			lineCap: 'round',
			lineJoin: 'round'
		};
		return S.group('neck_connected', null, [
			G.path('neck_skin_mass', [
				{ type: 'move', x: centerX - 5.6, y: topY },
				{ type: 'line', x: centerX + 5.6, y: topY },
				{ type: 'quad', cx: centerX + 7.5, cy: bottomY - 3, x: centerX + 7.8, y: bottomY },
				{ type: 'line', x: centerX - 7.8, y: bottomY },
				{ type: 'quad', cx: centerX - 7.5, cy: bottomY - 3, x: centerX - 5.6, y: topY }
			], { fill: colors.skin }),
			G.path('neck_left_contour', [
				{ type: 'move', x: centerX - 5.6, y: topY + 1 },
				{ type: 'quad', cx: centerX - 7.5, cy: bottomY - 3, x: centerX - 7.8, y: bottomY - 1 }
			], sideStyle),
			G.path('neck_right_contour', [
				{ type: 'move', x: centerX + 5.6, y: topY + 1 },
				{ type: 'quad', cx: centerX + 7.5, cy: bottomY - 3, x: centerX + 7.8, y: bottomY - 1 }
			], sideStyle)
		]);
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
		return S.group('robe_folds', null, [-22, -10, 7, 19].map((offset, index) => G.path(
			`robe_fold_${index}`,
			[
				{ type: 'move', x: skeleton.chest.x + offset, y: metrics.chestY + 15 },
				{ type: 'quad', cx: skeleton.chest.x + offset * 0.6, cy: metrics.waistY + 26, x: skeleton.chest.x + offset * 0.9, y: metrics.robeBottomY - 8 }
			],
			{ stroke: 'rgba(0,0,0,.18)', lineWidth: 1.2, lineCap: 'round' }
		)));
	}
}
