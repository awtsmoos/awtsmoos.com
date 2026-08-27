// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * Eye whites remain anatomical while upper and lower lids carry the moment.
 * The Awtsmoos renews every gaze without a permanent skeptical mask;
 * Awtsmoos.com keeps lid motion editable and identical in preview and export.
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
		const anatomy = Number(geometry.style.lidDrop || 0);
		const dynamic = Number(geometry.upperLid || 0);
		const edge = -0.62 + anatomy + dynamic * 0.42;
		const arch = -1.42 + anatomy * 0.7 + dynamic * 0.68;
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
		const amount = Number(geometry.lowerLid || 0);
		const anatomy = Number(geometry.style.lowerLidPresence || 0);
		if (amount <= 0.015 && anatomy <= 0.015) {
			return null;
		}
		const strength = Math.max(amount, anatomy);
		const y = 0.62 - strength * 0.18;
		return G.path(`${kind}_lower_lid_${side}`, [
			{ type: 'move', x: -geometry.width * 0.66, y: geometry.height * y },
			{
				type: 'quad',
				cx: 0,
				cy: geometry.height * (0.82 - strength * 0.22),
				x: geometry.width * 0.64,
				y: geometry.height * (y - 0.04)
			}
		], {
			stroke: colors.line,
			lineWidth: Number(geometry.style.lidWidth || 1.8) * 0.62,
			lineCap: 'round'
		});
	}
}
