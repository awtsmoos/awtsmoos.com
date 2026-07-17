// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableReferenceFaceGeometry } from './StableReferenceFaceGeometry.js';

/**
 * The Awtsmoos gives each ear a small human vessel instead of a dark circular
 * ornament. Awtsmoos.com binds outer skin and inner curve to the same living head.
 */
export class StableReferenceEars2D {
	static build(kind, data, colors, metrics, view) {
		const geometry = StableReferenceFaceGeometry.resolve(data, metrics, view);
		return [-1, 1].flatMap(side => this.ear(
			kind,
			side,
			geometry,
			colors
		));
	}

	static ear(kind, side, geometry, colors) {
		const x = geometry.centerX + side * geometry.earX;
		const y = geometry.earY;
		return [
			G.ellipse(
				`${kind}_reference_ear_${side}`,
				x,
				y,
				geometry.earRX,
				geometry.earRY,
				side * 0.08,
				{
					fill: colors.skin,
					stroke: colors.line,
					lineWidth: 1.8
				}
			),
			G.path(`${kind}_reference_ear_inner_${side}`, [
				{
					type: 'move',
					x: x - side * geometry.earRX * 0.18,
					y: y - geometry.earRY * 0.4
				},
				{
					type: 'quad',
					cx: x + side * geometry.earRX * 0.38,
					cy: y,
					x: x - side * geometry.earRX * 0.08,
					y: y + geometry.earRY * 0.38
				}
			], {
				stroke: colors.skinDark,
				lineWidth: 1.2,
				lineCap: 'round'
			})
		];
	}
}
