// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * A high crescent sweeps beneath the wrap while a small temple field stays quiet.
 * The Awtsmoos renews part and lobe without a central mask; Awtsmoos.com keeps
 * brow clearance, reach, side tuck, and line tiers stable in every export frame.
 */
export class StableFeminineFringe2D {
	static build(colors = {}, shell = {}, style = {}) {
		const geometry = this.geometry(shell, style);
		return G.group('feminine_side_part_fringe', null, [
			G.path('feminine_fringe_mass', this.mainCommands(geometry), {
				fill: colors.hair || '#42271c'
			}),
			G.path('feminine_fringe_root', this.sideCommands(geometry), {
				fill: colors.hair || '#42271c'
			}),
			this.mainEdge(colors, geometry, style),
			this.sideEdge(colors, geometry, style),
			this.part(geometry, style)
		]);
	}

	static geometry(shell, style) {
		const radiusX = Number(shell.radiusX || 34);
		const radiusY = Number(shell.radiusY || 40);
		const x = Number(shell.centerX || 0);
		const y = Number(shell.centerY || 0);
		return {
			partX: x + radiusX * Number(style.partOffset ?? 0.2),
			partY: y - radiusY * Number(style.partDepth ?? 0.64),
			leftX: x - radiusX * Number(style.sweepReach ?? 0.78),
			leftTopY: y - radiusY * Number(style.sweepTopDepth ?? 0.56),
			leftBottomY: y - radiusY * Number(style.sweepBottomDepth ?? 0.43),
			innerX: x - radiusX * Number(style.sweepInnerReach ?? 0.03),
			innerY: y - radiusY * Number(style.sweepInnerDepth ?? 0.48),
			rightX: x + radiusX * Number(style.sideReach ?? 0.5),
			rightTopY: y - radiusY * Number(style.sideTopDepth ?? 0.55),
			rightBottomY: y - radiusY * Number(style.sideBottomDepth ?? 0.42),
			rightInnerX: x + radiusX * Number(style.sideInnerReach ?? 0.31),
			rightInnerY: y - radiusY * Number(style.sideInnerDepth ?? 0.48)
		};
	}

	static mainCommands(g) {
		return [
			{ type: 'move', x: g.partX, y: g.partY },
			{ type: 'bezier', c1x: g.partX - 9, c1y: g.partY - 1, c2x: g.leftX + 8, c2y: g.partY + 2, x: g.leftX, y: g.leftTopY },
			{ type: 'quad', cx: g.leftX - 2, cy: (g.leftTopY + g.leftBottomY) / 2, x: g.leftX + 1, y: g.leftBottomY },
			{ type: 'bezier', c1x: g.leftX + 11, c1y: g.leftBottomY - 2, c2x: g.innerX - 7, c2y: g.innerY + 3, x: g.innerX, y: g.innerY },
			{ type: 'bezier', c1x: g.innerX + 6, c1y: g.innerY - 5, c2x: g.partX - 3, c2y: g.partY + 4, x: g.partX, y: g.partY },
			{ type: 'close' }
		];
	}

	static sideCommands(g) {
		return [
			{ type: 'move', x: g.partX, y: g.partY },
			{ type: 'bezier', c1x: g.partX + 5, c1y: g.partY, c2x: g.rightX - 3, c2y: g.partY + 2, x: g.rightX, y: g.rightTopY },
			{ type: 'quad', cx: g.rightX + 1, cy: (g.rightTopY + g.rightBottomY) / 2, x: g.rightX, y: g.rightBottomY },
			{ type: 'bezier', c1x: g.rightX - 6, c1y: g.rightBottomY - 1, c2x: g.rightInnerX + 4, c2y: g.rightInnerY + 2, x: g.rightInnerX, y: g.rightInnerY },
			{ type: 'bezier', c1x: g.rightInnerX - 3, c1y: g.rightInnerY - 4, c2x: g.partX + 2, c2y: g.partY + 3, x: g.partX, y: g.partY },
			{ type: 'close' }
		];
	}

	static mainEdge(colors, g, style) {
		return G.path('feminine_fringe_main_edge', [
			{ type: 'move', x: g.leftX + 1, y: g.leftBottomY },
			{ type: 'bezier', c1x: g.leftX + 11, c1y: g.leftBottomY - 2, c2x: g.innerX - 7, c2y: g.innerY + 3, x: g.innerX, y: g.innerY }
		], this.edgeStyle(colors, style));
	}

	static sideEdge(colors, g, style) {
		return G.path('feminine_fringe_side_edge', [
			{ type: 'move', x: g.rightX, y: g.rightBottomY },
			{ type: 'bezier', c1x: g.rightX - 6, c1y: g.rightBottomY - 1, c2x: g.rightInnerX + 4, c2y: g.rightInnerY + 2, x: g.rightInnerX, y: g.rightInnerY }
		], this.edgeStyle(colors, style));
	}

	static part(g, style) {
		return G.path('feminine_fringe_part', [
			{ type: 'move', x: g.partX, y: g.partY },
			{ type: 'line', x: g.partX - 1, y: g.partY + 7 }
		], {
			stroke: 'rgba(255,255,255,0.09)',
			lineWidth: Number(style.fringePartLineWidth || 0.55),
			lineCap: 'round'
		});
	}

	static edgeStyle(colors, style) {
		return {
			stroke: colors.hairDark || '#2c1912',
			lineWidth: Number(style.fringeLineWidth || 1),
			lineCap: 'round'
		};
	}
}
