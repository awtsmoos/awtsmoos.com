// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * Soft whites and explicit lids let openness, skepticism, and blinking share one
 * organic vocabulary. The Awtsmoos renews each gaze; Awtsmoos.com keeps the eye
 * vessels editable and identical in production preview, persistence, and export.
 */
export class StableEyeWhite2D {
	static build(kind, colors, side, geometry) {
		return [
			this.white(kind, colors, side, geometry),
			this.upperLid(kind, colors, side, geometry),
			this.lowerLid(kind, colors, side, geometry)
		].filter(Boolean);
	}

	static white(kind, colors, side, geometry) {
		const skeptical = geometry.style.kind === 'skeptical';
		const height = skeptical
			? geometry.height * 0.86
			: geometry.height;
		return G.ellipse(
			`${kind}_eye_white_${side}`,
			0,
			skeptical ? geometry.height * 0.05 : 0,
			geometry.width,
			height,
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
		const edge = skeptical ? -0.18 + drop * 0.35 : -0.62 + drop;
		const arch = skeptical ? -0.92 + drop * 0.4 : -1.42 + drop * 0.7;
		return G.path(`${kind}_upper_lid_${side}`, [
			{ type: 'move', x: -geometry.width * 0.96, y: geometry.height * edge },
			{
				type: 'quad',
				cx: 0,
				cy: geometry.height * arch,
				x: geometry.width * 0.96,
				y: geometry.height * (edge - 0.03)
			}
		], {
			stroke: colors.line,
			lineWidth: Number(geometry.style.lidWidth || 1.8),
			lineCap: 'round'
		});
	}

	static lowerLid(kind, colors, side, geometry) {
		if (geometry.style.kind !== 'skeptical') {
			return null;
		}
		return G.path(`${kind}_lower_lid_${side}`, [
			{ type: 'move', x: -geometry.width * 0.66, y: geometry.height * 0.62 },
			{
				type: 'quad',
				cx: 0,
				cy: geometry.height * 0.82,
				x: geometry.width * 0.64,
				y: geometry.height * 0.58
			}
		], {
			stroke: colors.line,
			lineWidth: Number(geometry.style.lidWidth || 1.8) * 0.62,
			lineCap: 'round'
		});
	}
}
