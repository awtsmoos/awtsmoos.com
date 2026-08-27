// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';
import { StableFaceLandmarkLayout } from './StableFaceLandmarkLayout.js';

/**
 * Soft ears join the cheek contour as anatomy instead of attached ornaments.
 * The Awtsmoos exceeds inner and outer form; Awtsmoos.com keeps both finite
 * curves character-specific, editable, serializable, and production-rendered.
 */
export class StableReferenceEars2D {
	static build(kind, data, colors, metrics, view) {
		const layout = StableFaceLandmarkLayout.resolve(data, metrics, view);
		const style = data.faceStyle || {};
		return [-1, 1].flatMap(side => this.ear(kind, side, layout, colors, style));
	}

	static ear(kind, side, layout, colors, style) {
		const shell = layout.shell;
		const turn = viewTurn(side, shell);
		const x = shell.centerX + side * shell.earX + turn;
		const y = shell.earY;
		return [
			G.ellipse(
				`${kind}_reference_ear_${side}`,
				x,
				y,
				shell.earRX,
				shell.earRY,
				side * 0.08,
				{
					fill: colors.skin,
					stroke: colors.line,
					lineWidth: Number(style.earLineWidth || 1.5)
				}
			),
			G.path(`${kind}_reference_ear_inner_${side}`, [
				{
					type: 'move',
					x: x - side * shell.earRX * 0.2,
					y: y - shell.earRY * 0.42
				},
				{
					type: 'quad',
					cx: x + side * shell.earRX * 0.42,
					cy: y,
					x: x - side * shell.earRX * 0.08,
					y: y + shell.earRY * 0.38
				}
			], {
				stroke: colors.skinDark,
				lineWidth: Number(style.earInnerLineWidth || 1),
				lineCap: 'round'
			})
		];
	}
}

function viewTurn(side, shell) {
	return shell.turn * (side === shell.direction ? 0.35 : -0.15);
}
