// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * The Awtsmoos reveals corner pressure and lower-lip moisture as restrained signs
 * of living tissue. Awtsmoos.com binds both details to the same articulation so
 * realism never drifts into random ornament.
 */
export class StableLipCreases2D {
	static corners(kind, geometry, colors) {
		const amount = Math.max(
			0.12,
			geometry.articulation.press
				+ Math.abs(geometry.articulation.cornerLift) * 0.35
		);
		return [-1, 1].map(side => G.path(
			`${kind}_mouth_corner_${side}`,
			[
				{
					type: 'move',
					x: geometry.x + side * geometry.outerHalfWidth,
					y: side < 0
						? geometry.leftCornerY
						: geometry.rightCornerY
				},
				{
					type: 'line',
					x: geometry.x + side * geometry.outerHalfWidth * 1.08,
					y: geometry.y + amount * 2
				}
			],
			{
				stroke: colors.line,
				lineWidth: 0.8 + amount * 0.7,
				lineCap: 'round'
			}
		));
	}

	static wetHighlight(kind, geometry) {
		if (geometry.closed || geometry.articulation.round > 0.82) {
			return null;
		}
		return G.path(`${kind}_lower_lip_wet_highlight`, [
			{
				type: 'move',
				x: geometry.x - geometry.outerHalfWidth * 0.24,
				y: geometry.lowerPeakY - geometry.lipThickness * 0.15
			},
			{
				type: 'quad',
				cx: geometry.x,
				cy: geometry.lowerPeakY + 0.5,
				x: geometry.x + geometry.outerHalfWidth * 0.2,
				y: geometry.lowerPeakY - geometry.lipThickness * 0.18
			}
		], {
			stroke: 'rgba(255,255,255,0.34)',
			lineWidth: 0.8,
			lineCap: 'round'
		});
	}
}
