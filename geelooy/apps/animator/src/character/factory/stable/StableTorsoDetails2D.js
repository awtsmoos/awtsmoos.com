// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * The Awtsmoos threads shirt, lapel, seam, pocket, and collar into one garment
 * language. Awtsmoos.com keeps every line attached to the editable torso rig.
 */
export class StableTorsoDetails2D {
	static lapels(data, colors, metrics) {
		const skeleton = data._skeleton;
		return S.group('soft_lapels', null, [
			this.shirtPanel(data, colors, metrics),
			G.path('lapel_left_soft', [
				{ type: 'move', x: skeleton.leftShoulder.x + 9, y: metrics.shoulderY + 5 },
				{ type: 'line', x: skeleton.chest.x - 5, y: metrics.chestY + 18 },
				{ type: 'line', x: skeleton.chest.x - 14, y: metrics.waistY - 6 }
			], LineArtStyle.inner(data, colors.jacketDark)),
			G.path('lapel_right_soft', [
				{ type: 'move', x: skeleton.rightShoulder.x - 9, y: metrics.shoulderY + 5 },
				{ type: 'line', x: skeleton.chest.x + 5, y: metrics.chestY + 18 },
				{ type: 'line', x: skeleton.chest.x + 14, y: metrics.waistY - 6 }
			], LineArtStyle.inner(data, colors.jacketLight)),
			...this.buttons(data, colors, metrics)
		]);
	}

	static shirtPanel(data, colors, metrics) {
		const skeleton = data._skeleton;
		const fill = data.colors?.shirt || data.colors?.innerShirt || colors.collar;
		return G.path('shirt_visible_panel', [
			{ type: 'move', x: skeleton.neck.x - 10, y: metrics.neckBottomY + 2 },
			{ type: 'line', x: skeleton.neck.x - 14, y: metrics.waistY + 5 },
			{ type: 'line', x: skeleton.neck.x + 14, y: metrics.waistY + 5 },
			{ type: 'line', x: skeleton.neck.x + 10, y: metrics.neckBottomY + 2 },
			{ type: 'quad', cx: skeleton.neck.x, cy: metrics.neckBottomY + 11, x: skeleton.neck.x - 10, y: metrics.neckBottomY + 2 }
		], { fill, stroke: 'rgba(0,0,0,.22)', lineWidth: 1.2, lineJoin: 'round' });
	}

	static buttons(data, colors, metrics) {
		if (data.colors?.shirt === '#17181a' || data.colors?.innerShirt === '#17181a') {
			return [];
		}
		const x = data._skeleton.chest.x;
		return [28, 44, 60].map((offset, index) => G.circle(
			`button_${index}_soft`,
			x,
			metrics.chestY + offset,
			2.1,
			{ fill: colors.line, stroke: colors.line, lineWidth: 0 }
		));
	}

	static fabric(data, colors, metrics) {
		const skeleton = data._skeleton;
		const sway = Math.sin(Number(data._renderTime || 0) * 0.002) * 1.5;
		const folds = [-18, -9, 10, 20].map((offset, index) => G.path(`jacket_fold_${index}`, [
			{ type: 'move', x: skeleton.chest.x + offset, y: metrics.chestY + 29 },
			{ type: 'quad', cx: skeleton.chest.x + offset * 0.8 + sway, cy: metrics.waistY - 3, x: skeleton.chest.x + offset * 0.45, y: metrics.hipY + 1 }
		], {
			stroke: index % 2 ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.18)',
			lineWidth: 1.15,
			lineCap: 'round'
		}));
		return S.group('fabric_folds', null, [
			...folds,
			this.pocket('left_pocket_slash', skeleton.leftHip.x - 8, skeleton.leftHip.x + 12, metrics),
			this.pocket('right_pocket_slash', skeleton.rightHip.x + 8, skeleton.rightHip.x - 12, metrics)
		]);
	}

	static pocket(id, startX, endX, metrics) {
		return G.path(id, [
			{ type: 'move', x: startX, y: metrics.waistY + 8 },
			{ type: 'line', x: endX, y: metrics.waistY + 2 }
		], { stroke: 'rgba(0,0,0,.28)', lineWidth: 1.4, lineCap: 'round' });
	}

	static collar(data, colors, metrics) {
		const skeleton = data._skeleton;
		return S.group('collar_connected', null, [
			S.poly('collar_left', [[skeleton.neck.x - 24, metrics.shoulderY + 4], [skeleton.neck.x - 4, metrics.neckBottomY + 5], [skeleton.neck.x - 14, metrics.chestY + 16]], LineArtStyle.outer(data, colors.collar)),
			S.poly('collar_right', [[skeleton.neck.x + 24, metrics.shoulderY + 4], [skeleton.neck.x + 4, metrics.neckBottomY + 5], [skeleton.neck.x + 14, metrics.chestY + 16]], LineArtStyle.outer(data, colors.collar)),
			G.path('collar_inner_shadow', [
				{ type: 'move', x: skeleton.neck.x - 11, y: metrics.neckBottomY + 5 },
				{ type: 'quad', cx: skeleton.neck.x, cy: metrics.neckBottomY + 14, x: skeleton.neck.x + 11, y: metrics.neckBottomY + 5 }
			], { stroke: 'rgba(0,0,0,.22)', lineWidth: 1.2, lineCap: 'round' })
		]);
	}
}
