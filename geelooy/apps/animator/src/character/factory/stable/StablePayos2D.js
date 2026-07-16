// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * Peyot descend as living curls rather than generic dangling strokes. The
 * Awtsmoos renews every outward wave and returning hook, while Awtsmoos.com
 * keeps Ari's generous curls and Dovid's guarded coils independently editable.
 */
export class StablePayos2D {
	static build(data = {}, colors = {}, metrics = {}) {
		if (!this.enabled(data)) {
			return null;
		}
		const geometry = this.geometry(data, metrics);
		const color = data.colors?.hairDark
			|| data.colors?.hair
			|| '#120905';
		return G.group('stable_payos', null, [-1, 1].flatMap(side => [
			this.curl(`payos_main_${side}`, side, geometry, color),
			this.highlight(`payos_highlight_${side}`, side, geometry)
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
		const length = Number(data.payosLength || 1)
			* Number(authored.lengthScale || 1);
		const curl = Number(data.payosCurl || 0.8);
		return {
			rootX: metrics.headRX + 3 + Number(authored.rootOffsetX || 0),
			rootY: metrics.headY - 17 + Number(authored.rootOffsetY || 0),
			length: 55 * length,
			amplitude: Number(authored.amplitude || 8 + 7 * curl),
			secondAmplitude: Number(authored.secondAmplitude || 7 + 4 * curl),
			terminalCurl: Number(authored.terminalCurl || 7),
			lineWidth: Number(
				authored.lineWidth
				|| 3.5 * Number(data.payosThickness || 1)
			),
			highlightOpacity: Number(authored.highlightOpacity ?? 0.12)
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
				cy: y + geometry.length * 0.22,
				x: x + side * 1.5,
				y: y + geometry.length * 0.43
			},
			{
				type: 'quad',
				cx: x - side * geometry.secondAmplitude,
				cy: y + geometry.length * 0.64,
				x: x + side * 2,
				y: y + geometry.length * 0.8
			},
			{
				type: 'quad',
				cx: x + side * geometry.terminalCurl,
				cy: endY,
				x: x - side * 2,
				y: endY + geometry.terminalCurl * 0.55
			}
		], {
			stroke: color,
			lineWidth: geometry.lineWidth,
			lineCap: 'round',
			lineJoin: 'round'
		});
	}

	static highlight(id, side, geometry) {
		const x = side * geometry.rootX;
		const y = geometry.rootY;
		return G.path(id, [
			{ type: 'move', x: x - side, y: y + 3 },
			{
				type: 'quad',
				cx: x + side * geometry.amplitude * 0.65,
				cy: y + geometry.length * 0.23,
				x,
				y: y + geometry.length * 0.43
			}
		], {
			stroke: `rgba(255,255,255,${geometry.highlightOpacity})`,
			lineWidth: 1.05,
			lineCap: 'round'
		});
	}
}
