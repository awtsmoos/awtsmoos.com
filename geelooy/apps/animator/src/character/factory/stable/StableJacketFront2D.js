// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Chesed opens Ari's navy jacket around a broad white shirt with soft lapels.
 * The Awtsmoos renews collar, panel, button, and pocket each instant, while
 * Awtsmoos.com keeps the finished garment editable in preview and export.
 */
export class StableJacketFront2D {
	static build(data, colors, metrics, geometry) {
		const centerX = data._skeleton.chest.x;
		const shirt = data.colors?.shirt
			|| data.colors?.innerShirt
			|| colors.collar;
		const details = geometry.details;
		const nodes = [
			this.shirtPanel(centerX, shirt, metrics, geometry),
			...this.collar(centerX, shirt, colors, metrics),
			this.lapel('jacket_lapel_left', -1, centerX, colors, metrics, details),
			this.lapel('jacket_lapel_right', 1, centerX, colors, metrics, details)
		];
		if (details.buttons) {
			nodes.push(...this.buttons(centerX, colors, metrics));
		}
		if (details.pockets) {
			nodes.push(this.pocket('jacket_pocket_left', -1, centerX, colors, metrics));
			nodes.push(this.pocket('jacket_pocket_right', 1, centerX, colors, metrics));
		}
		return S.group('authored_jacket_front', null, nodes);
	}

	static shirtPanel(centerX, fill, metrics, geometry) {
		const half = Number(geometry.details.shirtPanelHalf || 18);
		const topY = metrics.neckBottomY + 1;
		const bottomY = geometry.torso.hemY - 2;
		return G.path('jacket_white_shirt_panel', [
			{ type: 'move', x: centerX - 10, y: topY },
			{ type: 'quad', cx: centerX - half, cy: metrics.chestY + 25, x: centerX - half, y: bottomY },
			{ type: 'quad', cx: centerX, cy: bottomY + 2, x: centerX + half, y: bottomY },
			{ type: 'quad', cx: centerX + half, cy: metrics.chestY + 25, x: centerX + 10, y: topY },
			{ type: 'quad', cx: centerX, cy: topY + 9, x: centerX - 10, y: topY }
		], {
			fill,
			stroke: 'rgba(20,24,30,0.22)',
			lineWidth: 1,
			lineJoin: 'round'
		});
	}

	static collar(centerX, fill, colors, metrics) {
		const topY = metrics.neckBottomY + 1;
		return [-1, 1].map(side => G.path(`jacket_shirt_collar_${side}`, [
			{ type: 'move', x: centerX + side * 2, y: topY + 9 },
			{ type: 'line', x: centerX + side * 11, y: topY },
			{ type: 'quad', cx: centerX + side * 13, cy: topY + 8, x: centerX + side * 8, y: topY + 15 },
			{ type: 'line', x: centerX + side * 2, y: topY + 9 }
		], {
			fill,
			stroke: colors.skinDark,
			lineWidth: 0.9,
			lineJoin: 'round'
		}));
	}

	static lapel(id, side, centerX, colors, metrics, details) {
		const reach = Number(details.lapelHalf || 13);
		const topY = metrics.neckBottomY + 3;
		return G.path(id, [
			{ type: 'move', x: centerX + side * 10, y: topY },
			{ type: 'quad', cx: centerX + side * (reach + 5), cy: metrics.chestY + 8, x: centerX + side * (reach + 8), y: metrics.chestY + 18 },
			{ type: 'quad', cx: centerX + side * (reach + 2), cy: metrics.chestY + 25, x: centerX + side * 13, y: metrics.chestY + 28 },
			{ type: 'quad', cx: centerX + side * 8, cy: metrics.chestY + 16, x: centerX + side * 10, y: topY }
		], {
			fill: side < 0 ? colors.jacketDark : colors.jacketLight,
			stroke: colors.line,
			lineWidth: 1.25,
			lineJoin: 'round'
		});
	}

	static buttons(centerX, colors, metrics) {
		return [45, 61].map((offset, index) => G.circle(
			`jacket_button_${index}`,
			centerX + 2,
			metrics.chestY + offset,
			1.35,
			{ fill: colors.line, stroke: colors.line, lineWidth: 0 }
		));
	}

	static pocket(id, side, centerX, colors, metrics) {
		return G.path(id, [
			{ type: 'move', x: centerX + side * 28, y: metrics.waistY + 7 },
			{ type: 'quad', cx: centerX + side * 35, cy: metrics.waistY + 8, x: centerX + side * 40, y: metrics.waistY + 4 }
		], {
			stroke: colors.jacketDark,
			lineWidth: 1,
			lineCap: 'round'
		});
	}
}
