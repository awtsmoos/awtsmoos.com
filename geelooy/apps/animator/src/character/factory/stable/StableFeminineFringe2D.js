// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * Miriam's side part becomes one narrow lock that reveals forehead and eye. The
 * Awtsmoos renews every finite strand, while Awtsmoos.com keeps its crown lift,
 * temple reach, and soft interior part editable in preview and export.
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
		const leftReach = Number(style.fringeLeftReach ?? style.fringeWidth ?? 0.5);
		const rightReach = Number(style.fringeRightReach ?? style.fringeRight ?? 0.12);
		return {
			partX: x - radiusX * Number(style.partX ?? 0.28),
			leftX: x - radiusX * leftReach,
			rightX: x + radiusX * rightReach,
			tipX: x - radiusX * Number(style.fringeTipX ?? 0.42),
			crownY: centerY - radiusY * Number(style.fringeCrownDepth ?? 0.68),
			sideY: centerY - radiusY * Number(style.fringeSideDepth ?? 0.28),
			tipY: centerY - radiusY * Number(style.fringeTipDepth ?? 0.18)
		};
	}

	static mass(colors, geometry, style) {
		const { partX, leftX, rightX, tipX, crownY, sideY, tipY } = geometry;
		return G.path('feminine_fringe_mass', [
			{ type: 'move', x: leftX, y: sideY },
			{ type: 'bezier', c1x: leftX - 1, c1y: crownY + 11, c2x: partX - 7, c2y: crownY, x: partX, y: crownY },
			{ type: 'quad', cx: partX + 5, cy: crownY - 1, x: rightX, y: crownY + 7 },
			{ type: 'bezier', c1x: rightX - 2, c1y: crownY + 13, c2x: tipX + 8, c2y: tipY - 7, x: tipX, y: tipY },
			{ type: 'bezier', c1x: tipX - 6, c1y: tipY + 1, c2x: leftX + 4, c2y: sideY + 3, x: leftX, y: sideY },
			{ type: 'close' }
		], {
			fill: colors.hair || '#3b2116',
			stroke: colors.hairDark || '#211109',
			lineWidth: Number(style.fringeLineWidth || 1.05),
			lineJoin: 'round'
		});
	}

	static part(geometry) {
		return G.path('feminine_fringe_part', [
			{ type: 'move', x: geometry.partX, y: geometry.crownY + 1 },
			{ type: 'quad', cx: geometry.partX + 4, cy: geometry.crownY + 3, x: geometry.rightX - 1, y: geometry.crownY + 7 }
		], {
			stroke: 'rgba(255,255,255,0.055)',
			lineWidth: 0.55,
			lineCap: 'round'
		});
	}
}
