// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * A side-part lock sweeps around Miriam's forehead without becoming a slab. The
 * Awtsmoos renews every finite strand, while Awtsmoos.com keeps its lift, sweep,
 * and temple taper editable in the same production graph used for export.
 */
export class StableFeminineFringe2D {
	static build(colors = {}, shell = {}, style = {}) {
		const geometry = this.geometry(shell, style);
		return G.group('feminine_side_part_fringe', null, [
			this.mass(colors, geometry, style),
			this.part(geometry)
		]);
	}

	static geometry(shell, style) {
		const radiusX = Number(shell.radiusX || 34);
		const radiusY = Number(shell.radiusY || 40);
		const x = Number(shell.centerX || 0);
		const centerY = Number(shell.centerY || 0);
		return {
			partX: x - radiusX * Number(style.partX ?? 0.24),
			leftX: x - radiusX * Number(style.fringeLeftReach ?? 0.68),
			rightX: x + radiusX * Number(style.fringeRightReach ?? 0.42),
			tipX: x + radiusX * Number(style.fringeTipX ?? 0.3),
			crownY: centerY - radiusY * Number(style.fringeCrownDepth ?? 0.72),
			sideY: centerY - radiusY * Number(style.fringeSideDepth ?? 0.3),
			tipY: centerY - radiusY * Number(style.fringeTipDepth ?? 0.34)
		};
	}

	static mass(colors, g, style) {
		return G.path('feminine_fringe_mass', [
			{ type: 'move', x: g.leftX, y: g.sideY },
			{ type: 'bezier', c1x: g.leftX - 1, c1y: g.crownY + 8, c2x: g.partX - 6, c2y: g.crownY, x: g.partX, y: g.crownY },
			{ type: 'bezier', c1x: g.partX + 7, c1y: g.crownY - 1, c2x: g.rightX + 2, c2y: g.crownY + 10, x: g.rightX, y: g.sideY - 2 },
			{ type: 'bezier', c1x: g.rightX - 2, c1y: g.sideY + 4, c2x: g.tipX + 5, c2y: g.tipY - 3, x: g.tipX, y: g.tipY },
			{ type: 'bezier', c1x: g.tipX - 9, c1y: g.tipY + 7, c2x: g.leftX + 6, c2y: g.sideY + 5, x: g.leftX, y: g.sideY },
			{ type: 'close' }
		], {
			fill: colors.hair || '#42271c',
			stroke: colors.hairDark || '#2c1912',
			lineWidth: Number(style.fringeLineWidth || 1),
			lineJoin: 'round'
		});
	}

	static part(g) {
		return G.path('feminine_fringe_part', [
			{ type: 'move', x: g.partX, y: g.crownY + 1 },
			{ type: 'quad', cx: g.partX + 6, cy: g.crownY + 3, x: g.rightX - 2, y: g.sideY - 2 }
		], {
			stroke: 'rgba(255,255,255,0.06)',
			lineWidth: 0.5,
			lineCap: 'round'
		});
	}
}
