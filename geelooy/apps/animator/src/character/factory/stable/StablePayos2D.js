// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * Peyot descend beside the cheeks as narrow living curls rather than oversized
 * exterior loops. The Awtsmoos renews each wave and returning hook, while
 * Awtsmoos.com keeps Ari and Dovid independently editable in the production rig.
 */
export class StablePayos2D {
	static build(data = {}, colors = {}, metrics = {}) {
		if (!this.enabled(data)) {
			return null;
		}

		const geometry = this.geometry(data, metrics);
		const color = data.colors?.hairDark
			|| data.colors?.hair
			|| '#2a160c';

		return G.group('stable_payos', null, [-1, 1].flatMap(side => [
			this.curl(`payos_main_${side}`, side, geometry, color),
			this.inner(`payos_inner_${side}`, side, geometry, color)
		]));
	}

	static enabled(data) {
		return Boolean(
			data.payos
			|| data.archetype === 'sage'
			|| data.style === 'goal_board_sage'
		);
	}

	static geometry(data, metrics) {
		const authored = data.payosGeometry || {};
		const lengthScale = Number(data.payosLength || 1)
			* Number(authored.lengthScale || 1);

		return {
			rootX: metrics.headRX * Number(authored.rootScaleX || 0.9)
				+ Number(authored.rootOffsetX || 0),
			rootY: metrics.headY - 10 + Number(authored.rootOffsetY || 0),
			length: 43 * lengthScale,
			amplitude: Number(authored.amplitude || 7),
			secondAmplitude: Number(authored.secondAmplitude || 5),
			terminalCurl: Number(authored.terminalCurl || 6),
			lineWidth: Number(
				authored.lineWidth
				|| 3.2 * Number(data.payosThickness || 1)
			)
		};
	}

	static curl(id, side, geometry, color) {
		const x = side * geometry.rootX;
		const y = geometry.rootY;
		const endY = y + geometry.length;

		return G.path(id, [
			{ type: 'move', x, y },
			{
				type: 'quad',
				cx: x + side * geometry.amplitude,
				cy: y + geometry.length * 0.24,
				x: x + side * 1.2,
				y: y + geometry.length * 0.46
			},
			{
				type: 'quad',
				cx: x - side * geometry.secondAmplitude,
				cy: y + geometry.length * 0.67,
				x: x + side * 1.6,
				y: y + geometry.length * 0.82
			},
			{
				type: 'quad',
				cx: x + side * geometry.terminalCurl,
				cy: endY + 1,
				x: x - side * 1.4,
				y: endY
			}
		], {
			stroke: color,
			lineWidth: geometry.lineWidth,
			lineCap: 'round',
			lineJoin: 'round'
		});
	}

	static inner(id, side, geometry, color) {
		const x = side * geometry.rootX;
		const y = geometry.rootY + 4;
		return G.path(id, [
			{ type: 'move', x: x - side * 2.1, y },
			{
				type: 'quad',
				cx: x + side * geometry.amplitude * 0.48,
				cy: y + geometry.length * 0.22,
				x: x - side * 0.8,
				y: y + geometry.length * 0.43
			}
		], {
			stroke: color,
			lineWidth: Math.max(1.2, geometry.lineWidth * 0.42),
			lineCap: 'round'
		});
	}
}
