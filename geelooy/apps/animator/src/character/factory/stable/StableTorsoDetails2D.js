// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';
import { StableBodyGeometry } from './StableBodyGeometry.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * The Awtsmoos threads jacket opening, shirt placket, lapel, fold, pocket, and
 * collar through one editable garment language. Awtsmoos.com keeps internal lines
 * attached to the authored torso instead of allowing generic seams to dictate it.
 */
export class StableTorsoDetails2D {
	static lapels(data, colors, metrics, suppliedGeometry = null) {
		const geometry = suppliedGeometry || StableBodyGeometry.resolve(data, metrics);
		if (geometry.torso.garmentKind === 'shirt') {
			return this.shirtFront(data, colors, metrics, geometry);
		}
		const skeleton = data._skeleton;
		const half = geometry.details.lapelHalf;
		return S.group('soft_lapels', null, [
			this.shirtPanel(data, colors, metrics, geometry),
			G.path('lapel_left_soft', [
				{ type: 'move', x: skeleton.leftShoulder.x + 8, y: metrics.shoulderY + 5 },
				{ type: 'line', x: skeleton.chest.x - 5, y: metrics.chestY + 18 },
				{ type: 'line', x: skeleton.chest.x - half, y: metrics.waistY - 5 }
			], LineArtStyle.inner(data, colors.jacketDark)),
			G.path('lapel_right_soft', [
				{ type: 'move', x: skeleton.rightShoulder.x - 8, y: metrics.shoulderY + 5 },
				{ type: 'line', x: skeleton.chest.x + 5, y: metrics.chestY + 18 },
				{ type: 'line', x: skeleton.chest.x + half, y: metrics.waistY - 5 }
			], LineArtStyle.inner(data, colors.jacketLight)),
			...this.buttons(data, colors, metrics, geometry)
		]);
	}

	static shirtPanel(data, colors, metrics, geometry) {
		const x = data._skeleton.neck.x;
		const half = geometry.details.shirtPanelHalf;
		const fill = data.colors?.shirt || data.colors?.innerShirt || colors.collar;
		return G.path('shirt_visible_panel', [
			{ type: 'move', x: x - 9, y: metrics.neckBottomY + 2 },
			{ type: 'line', x: x - half, y: metrics.waistY + 4 },
			{ type: 'line', x: x + half, y: metrics.waistY + 4 },
			{ type: 'line', x: x + 9, y: metrics.neckBottomY + 2 },
			{ type: 'quad', cx: x, cy: metrics.neckBottomY + 11, x: x - 9, y: metrics.neckBottomY + 2 }
		], { fill, stroke: 'rgba(0,0,0,.22)', lineWidth: 1.2, lineJoin: 'round' });
	}

	static shirtFront(data, colors, metrics, geometry) {
		const x = data._skeleton.chest.x;
		return S.group('shirt_front_details', null, [
			G.path('shirt_placket', [
				{ type: 'move', x, y: metrics.neckBottomY + 10 },
				{ type: 'line', x, y: geometry.torso.hemY - 8 }
			], LineArtStyle.inner(data, colors.jacketDark)),
			...this.buttons(data, colors, metrics, geometry)
		]);
	}

	static buttons(data, colors, metrics, geometry) {
		if (!geometry.details.buttons) {
			return [];
		}
		const x = data._skeleton.chest.x;
		return [25, 43, 61].map((offset, index) => G.circle(
			`button_${index}_soft`,
			x,
			metrics.chestY + offset,
			2,
			{ fill: colors.line, stroke: colors.line, lineWidth: 0 }
		));
	}

	static fabric(data, colors, metrics, suppliedGeometry = null) {
		const geometry = suppliedGeometry || StableBodyGeometry.resolve(data, metrics);
		const skeleton = data._skeleton;
		const sway = Math.sin(Number(data._renderTime || 0) * 0.002) * 1.2;
		const folds = [-18, -8, 9, 19].map((offset, index) => G.path(`jacket_fold_${index}`, [
			{ type: 'move', x: skeleton.chest.x + offset, y: metrics.chestY + 31 },
			{ type: 'quad', cx: skeleton.chest.x + offset * 0.75 + sway, cy: metrics.waistY - 2, x: skeleton.chest.x + offset * 0.45, y: geometry.torso.hemY - 2 }
		], { stroke: index % 2 ? 'rgba(0,0,0,.14)' : 'rgba(255,255,255,.13)', lineWidth: 1.05, lineCap: 'round' }));
		if (!geometry.details.pockets) {
			return S.group('fabric_folds', null, folds);
		}
		return S.group('fabric_folds', null, [
			...folds,
			this.pocket('left_pocket_slash', -1, skeleton, metrics),
			this.pocket('right_pocket_slash', 1, skeleton, metrics)
		]);
	}

	static pocket(id, side, skeleton, metrics) {
		const hipX = side < 0 ? skeleton.leftHip.x : skeleton.rightHip.x;
		return G.path(id, [
			{ type: 'move', x: hipX - side * 10, y: metrics.waistY + 8 },
			{ type: 'line', x: hipX + side * 10, y: metrics.waistY + 2 }
		], { stroke: 'rgba(0,0,0,.3)', lineWidth: 1.4, lineCap: 'round' });
	}

	static collar(data, colors, metrics) {
		const x = data._skeleton.neck.x;
		return S.group('collar_connected', null, [
			S.poly('collar_left', [[x - 24, metrics.shoulderY + 4], [x - 4, metrics.neckBottomY + 5], [x - 14, metrics.chestY + 16]], LineArtStyle.outer(data, colors.collar)),
			S.poly('collar_right', [[x + 24, metrics.shoulderY + 4], [x + 4, metrics.neckBottomY + 5], [x + 14, metrics.chestY + 16]], LineArtStyle.outer(data, colors.collar)),
			G.path('collar_inner_shadow', [{ type: 'move', x: x - 11, y: metrics.neckBottomY + 5 }, { type: 'quad', cx: x, cy: metrics.neckBottomY + 14, x: x + 11, y: metrics.neckBottomY + 5 }], { stroke: 'rgba(0,0,0,.22)', lineWidth: 1.2, lineCap: 'round' })
		]);
	}
}
