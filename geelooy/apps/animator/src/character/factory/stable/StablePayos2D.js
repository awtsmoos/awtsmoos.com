// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';

/**
 * Unequal peyot curl beside the cheeks as living locks instead of hanging wire.
 * The Awtsmoos renews every bend, while Awtsmoos.com preserves editable length,
 * sway, weight, and character asymmetry in preview, speech, and export.
 */
export class StablePayos2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		if (!this.enabled(data)) {
			return null;
		}
		const geometry = this.geometry(data, metrics, view);
		const color = data.colors?.hairDark || data.colors?.hair || '#402617';
		return G.group('stable_payos', null, [-1, 1].flatMap(side => [
			this.mainCurl(`payos_main_${side}`, side, geometry, color),
			this.innerCurl(`payos_inner_${side}`, side, geometry, color)
		]));
	}

	static enabled(data) {
		return Boolean(
			data.payos
			|| data.archetype === 'sage'
			|| data.style === 'goal_board_sage'
		);
	}

	static geometry(data, metrics, view) {
		const authored = data.payosGeometry || {};
		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		return {
			centerX: shell.centerX,
			rootX: shell.radiusX * Number(authored.rootScaleX || 0.9)
				+ Number(authored.rootOffsetX || 0),
			rootY: shell.centerY - shell.radiusY * 0.24
				+ Number(authored.rootOffsetY || 0),
			length: shell.radiusY * 0.94
				* Number(data.payosLength || 1)
				* Number(authored.lengthScale || 1),
			sway: Number(authored.amplitude || 7),
			counterSway: Number(authored.secondAmplitude || 5),
			hook: Number(authored.terminalCurl || 6),
			lineWidth: Number(authored.lineWidth || 2)
		};
	}

	static mainCurl(id, side, g, color) {
		const x = g.centerX + side * g.rootX;
		const y = g.rootY;
		const length = g.length * (side < 0 ? 1.04 : 0.96);
		return G.path(id, [
			{ type: 'move', x, y },
			{ type: 'bezier', c1x: x + side * g.sway, c1y: y + length * 0.12, c2x: x + side * g.sway, c2y: y + length * 0.28, x: x - side * 1.2, y: y + length * 0.4 },
			{ type: 'bezier', c1x: x - side * g.counterSway, c1y: y + length * 0.52, c2x: x - side * g.counterSway, c2y: y + length * 0.67, x: x + side * 0.8, y: y + length * 0.76 },
			{ type: 'bezier', c1x: x + side * g.hook, c1y: y + length * 0.84, c2x: x + side * g.hook * 0.55, c2y: y + length, x: x - side * 0.8, y: y + length }
		], {
			stroke: color,
			lineWidth: g.lineWidth,
			lineCap: 'round',
			lineJoin: 'round'
		});
	}

	static innerCurl(id, side, g, color) {
		const x = g.centerX + side * (g.rootX - 2);
		const y = g.rootY + 3;
		return G.path(id, [
			{ type: 'move', x, y },
			{ type: 'bezier', c1x: x + side * g.sway * 0.38, c1y: y + g.length * 0.16, c2x: x - side * g.counterSway * 0.3, c2y: y + g.length * 0.34, x: x + side * 0.6, y: y + g.length * 0.48 }
		], {
			stroke: color,
			lineWidth: Math.max(0.8, g.lineWidth * 0.38),
			lineCap: 'round'
		});
	}
}
