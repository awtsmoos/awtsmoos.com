// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * The Awtsmoos reveals open, hooded, and skeptical eye whites beneath one living
 * lid. Awtsmoos.com keeps outline and lid geometry bound to shared blink, gaze,
 * perspective, and character style.
 */
export class StableEyeWhite2D {
	static build(kind, colors, side, geometry) {
		return [
			this.white(kind, colors, side, geometry),
			this.upperLid(kind, colors, side, geometry)
		];
	}

	static white(kind, colors, side, geometry) {
		if (geometry.style.kind === 'skeptical') {
			return G.path(`${kind}_eye_white_${side}`, [
				{ type: 'move', x: -geometry.width, y: 0 },
				{
					type: 'quad',
					cx: 0,
					cy: -geometry.height * 1.05,
					x: geometry.width,
					y: -geometry.height * 0.08
				},
				{
					type: 'quad',
					cx: 0,
					cy: geometry.height * 0.82,
					x: -geometry.width,
					y: 0
				}
			], {
				fill: colors.eyeLight,
				stroke: colors.line,
				lineWidth: Number(geometry.style.outlineWidth || 1.9),
				lineJoin: 'round'
			});
		}
		return G.ellipse(
			`${kind}_eye_white_${side}`,
			0,
			0,
			geometry.width,
			geometry.height,
			geometry.rotation,
			{
				fill: colors.eyeLight,
				stroke: colors.line,
				lineWidth: Number(geometry.style.outlineWidth || 1.9)
			}
		);
	}

	static upperLid(kind, colors, side, geometry) {
		const drop = Number(geometry.style.lidDrop || 0);
		const skeptical = geometry.style.kind === 'skeptical';
		return G.path(`${kind}_upper_lid_${side}`, [
			{
				type: 'move',
				x: -geometry.width,
				y: -geometry.height * (
					skeptical ? 0.12 : 0.62 - drop
				)
			},
			{
				type: 'quad',
				cx: 0,
				cy: -geometry.height * (
					skeptical ? 1.12 : 1.45 - drop * 0.7
				),
				x: geometry.width,
				y: -geometry.height * (
					skeptical ? 0.2 : 0.62 - drop
				)
			}
		], {
			stroke: colors.line,
			lineWidth: Number(geometry.style.lidWidth || 1.8),
			lineCap: 'round'
		});
	}
}
