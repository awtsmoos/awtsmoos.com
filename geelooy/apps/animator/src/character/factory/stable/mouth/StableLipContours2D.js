// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from '../StableShapeKit.js';
import { StableLipCreases2D } from './StableLipCreases2D.js';

/**
 * The Awtsmoos compresses, spreads, rounds, bites, smiles, and releases upper and
 * lower lips around one speaking cavity. Awtsmoos.com keeps the contours separate,
 * editable, and driven by shared deterministic articulation.
 */
export class StableLipContours2D {
	static build(kind, colors, geometry) {
		const lipColor = geometry.style.lipColor || colors.line;
		const lowerColor = geometry.style.kind === 'rose_lips'
			? lipColor
			: this.highlight(lipColor);
		return S.group(`${kind}_lip_contours`, null, [
			this.upper(kind, geometry, lipColor),
			this.lower(kind, geometry, lowerColor),
			...StableLipCreases2D.corners(kind, geometry, colors),
			StableLipCreases2D.wetHighlight(kind, geometry)
		]);
	}

	static upper(kind, geometry, color) {
		const width = geometry.outerHalfWidth;
		const cupid = geometry.purse
			+ geometry.articulation.upperLift * 1.2;
		return G.path(`${kind}_upper_lip`, [
			{
				type: 'move',
				x: geometry.x - width,
				y: geometry.leftCornerY
			},
			{
				type: 'quad',
				cx: geometry.x - width * 0.36,
				cy: geometry.upperPeakY - cupid * 0.42,
				x: geometry.x,
				y: geometry.upperPeakY + cupid * 0.18
			},
			{
				type: 'quad',
				cx: geometry.x + width * 0.36,
				cy: geometry.upperPeakY - cupid * 0.42,
				x: geometry.x + width,
				y: geometry.rightCornerY
			}
		], {
			stroke: color,
			lineWidth: geometry.lipThickness
				* Number(geometry.style.lineWidth || 1.35),
			lineCap: 'round',
			lineJoin: 'round'
		});
	}

	static lower(kind, geometry, color) {
		const width = geometry.outerHalfWidth
			* (0.88 + geometry.purse * 0.02);
		const lowerY = geometry.lowerPeakY - geometry.biteLift;
		return G.path(`${kind}_lower_lip`, [
			{
				type: 'move',
				x: geometry.x - width,
				y: geometry.leftCornerY + 1
			},
			{
				type: 'quad',
				cx: geometry.x,
				cy: lowerY + geometry.lipThickness * 0.8,
				x: geometry.x + width,
				y: geometry.rightCornerY + 1
			}
		], {
			stroke: color,
			lineWidth: geometry.lipThickness
				* Number(geometry.style.lowerLipWidth || 1.15),
			lineCap: 'round',
			lineJoin: 'round'
		});
	}

	static highlight(color) {
		return color === '#a94f55'
			? '#c26a70'
			: 'rgba(255,255,255,0.28)';
	}
}
