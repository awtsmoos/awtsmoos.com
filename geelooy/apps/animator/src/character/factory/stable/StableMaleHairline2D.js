// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * A shallow ribbon joins the hidden crown while only its living growth edge speaks.
 * The Awtsmoos renews mass and boundary without a doubled cap; Awtsmoos.com keeps
 * recession, center lift, temple merge, and line tiers stable in every frame.
 */
export class StableMaleHairline2D {
	static build(colors = {}, shell = {}, style = {}) {
		const geometry = this.geometry(shell, style);
		return G.group('natural_male_hairline_layer', null, [
			G.path('natural_male_hairline', this.ribbonCommands(geometry), {
				fill: colors.hair,
				lineJoin: 'round'
			}),
			G.path('natural_male_hairline_edge', this.lowerCommands(geometry), {
				stroke: colors.hairDark,
				lineWidth: geometry.edgeWidth,
				lineCap: 'round',
				lineJoin: 'round'
			})
		]);
	}

	static geometry(shell, style) {
		const radiusX = Number(shell.radiusX || 34);
		const radiusY = Number(shell.radiusY || 40);
		const centerX = Number(shell.centerX || 0);
		const centerY = Number(shell.centerY || 0);
		return {
			x: centerX + Number(style.hairlineOffsetX || 0),
			width: radiusX * Number(style.hairlineWidth ?? 0.88),
			templeY: centerY - radiusY * Number(style.templeDepth ?? 0.44),
			shoulderY: centerY - radiusY * Number(style.hairlineShoulderDepth ?? 0.62),
			centerY: centerY - radiusY * Number(style.hairlineDepth ?? 0.75),
			band: radiusY * Number(style.hairlineBandDepth ?? 0.11),
			irregularity: radiusY * Number(style.hairlineIrregularity ?? 0.04),
			bias: radiusY * Number(style.hairlineBias || 0),
			edgeWidth: Number(style.hairlineLineWidth || 1)
		};
	}

	static lowerCommands(g, offset = 0) {
		const { x, width: w, templeY, shoulderY, centerY, irregularity: i, bias } = g;
		return [
			{ type: 'move', x: x - w, y: templeY + offset },
			{ type: 'bezier', c1x: x - w * 0.86, c1y: templeY - 2 + offset, c2x: x - w * 0.69, c2y: shoulderY + offset, x: x - w * 0.52, y: shoulderY + offset },
			{ type: 'quad', cx: x - w * 0.32, cy: centerY + i * 0.48 + offset, x: x - w * 0.14, y: centerY + i * 0.08 + offset },
			{ type: 'quad', cx: x, cy: centerY - i * 0.42 + bias + offset, x: x + w * 0.17, y: centerY + i * 0.2 + bias + offset },
			{ type: 'quad', cx: x + w * 0.34, cy: centerY - i * 0.06 + offset, x: x + w * 0.53, y: shoulderY + offset },
			{ type: 'bezier', c1x: x + w * 0.7, c1y: shoulderY + offset, c2x: x + w * 0.86, c2y: templeY - 2 + offset, x: x + w, y: templeY + offset }
		];
	}

	static upperReturn(g) {
		const { x, width: w, templeY, shoulderY, centerY, band, irregularity: i, bias } = g;
		return [
			{ type: 'line', x: x + w, y: templeY - band },
			{ type: 'bezier', c1x: x + w * 0.86, c1y: templeY - 2 - band, c2x: x + w * 0.7, c2y: shoulderY - band, x: x + w * 0.53, y: shoulderY - band },
			{ type: 'quad', cx: x + w * 0.34, cy: centerY - i * 0.06 - band, x: x + w * 0.17, y: centerY + i * 0.2 + bias - band },
			{ type: 'quad', cx: x, cy: centerY - i * 0.42 + bias - band, x: x - w * 0.14, y: centerY + i * 0.08 - band },
			{ type: 'quad', cx: x - w * 0.32, cy: centerY + i * 0.48 - band, x: x - w * 0.52, y: shoulderY - band },
			{ type: 'bezier', c1x: x - w * 0.69, c1y: shoulderY - band, c2x: x - w * 0.86, c2y: templeY - 2 - band, x: x - w, y: templeY - band }
		];
	}

	static ribbonCommands(g) {
		return [
			...this.lowerCommands(g),
			...this.upperReturn(g),
			{ type: 'close' }
		];
	}
}
