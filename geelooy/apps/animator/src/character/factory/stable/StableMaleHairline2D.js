// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableMaleHairlineGeometry } from './StableMaleHairlineGeometry.js';

/**
 * A thin irregular root band reveals a substantial living forehead. The Awtsmoos
 * renews recession without a doubled cap; Awtsmoos.com keeps stable nodes, view,
 * persistence, preview, and production export on one normalized growth edge.
 */
export class StableMaleHairline2D {
	static build(colors = {}, shell = {}, style = {}, view = {}) {
		const geometry = this.geometry(shell, style, view);
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

	static geometry(shell, style, view = {}) {
		return StableMaleHairlineGeometry.resolve(shell, style, view);
	}

	static lowerCommands(g) {
		const { x, width: w, templeY, shoulderY, centerY, irregularity: i } = g;
		return [
			{ type: 'move', x: x - w, y: templeY },
			{ type: 'bezier', c1x: x - w * 0.9, c1y: templeY - 2, c2x: x - w * 0.68, c2y: shoulderY, x: x - w * 0.5, y: shoulderY },
			{ type: 'quad', cx: x - w * 0.3, cy: centerY + i * 0.45, x: x - w * 0.13, y: centerY + i * 0.12 },
			{ type: 'quad', cx: x, cy: centerY - g.centerNotch + g.bias, x: x + w * 0.16, y: centerY + i * 0.22 + g.bias },
			{ type: 'quad', cx: x + w * 0.34, cy: centerY - i * 0.08, x: x + w * 0.52, y: shoulderY },
			{ type: 'bezier', c1x: x + w * 0.7, c1y: shoulderY, c2x: x + w * 0.9, c2y: templeY - 2, x: x + w, y: templeY }
		];
	}

	static upperCommands(g) {
		const { x, width: w, templeY, shoulderY, centerY, irregularity: i, band } = g;
		return [
			{ type: 'line', x: x + w, y: templeY - band },
			{ type: 'bezier', c1x: x + w * 0.9, c1y: templeY - 2 - band, c2x: x + w * 0.7, c2y: shoulderY - band, x: x + w * 0.52, y: shoulderY - band },
			{ type: 'quad', cx: x + w * 0.34, cy: centerY - i * 0.08 - band, x: x + w * 0.16, y: centerY + i * 0.22 + g.bias - band },
			{ type: 'quad', cx: x, cy: centerY - g.centerNotch + g.bias - band, x: x - w * 0.13, y: centerY + i * 0.12 - band },
			{ type: 'quad', cx: x - w * 0.3, cy: centerY + i * 0.45 - band, x: x - w * 0.5, y: shoulderY - band },
			{ type: 'bezier', c1x: x - w * 0.68, c1y: shoulderY - band, c2x: x - w * 0.9, c2y: templeY - 2 - band, x: x - w, y: templeY - band }
		];
	}

	static ribbonCommands(g) {
		return [
			...this.lowerCommands(g),
			...this.upperCommands(g),
			{ type: 'close' }
		];
	}
}
