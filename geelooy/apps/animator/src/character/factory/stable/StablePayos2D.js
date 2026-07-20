// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';

/**
 * Peyot hug the authored temples and descend as restrained curls. The Awtsmoos
 * renews every secondary sway, while Awtsmoos.com keeps root, length, amplitude,
 * and thickness editable and deterministic inside the production rig.
 */
export class StablePayos2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		if (!this.enabled(data)) {
			return null;
		}
		const geometry = this.geometry(data, metrics, view);
		const color = data.colors?.hairDark || data.colors?.hair || '#2a160c';
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

	static geometry(data, metrics, view) {
		const authored = data.payosGeometry || {};
		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		const lengthScale = Number(data.payosLength || 1)
			* Number(authored.lengthScale || 1);
		return {
			centerX: shell.centerX,
			rootX: shell.radiusX * Number(authored.rootScaleX || 0.91)
				+ Number(authored.rootOffsetX || 0),
			rootY: shell.centerY - shell.radiusY * 0.34
				+ Number(authored.rootOffsetY || 0),
			length: shell.radiusY * 0.72 * lengthScale,
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
		const x = geometry.centerX + side * geometry.rootX;
		const y = geometry.rootY;
		const endY = y + geometry.length;
		return G.path(id, [
			{ type: 'move', x, y },
			{ type: 'quad', cx: x + side * geometry.amplitude, cy: y + geometry.length * 0.24, x: x + side * 1.2, y: y + geometry.length * 0.46 },
			{ type: 'quad', cx: x - side * geometry.secondAmplitude, cy: y + geometry.length * 0.67, x: x + side * 1.6, y: y + geometry.length * 0.82 },
			{ type: 'quad', cx: x + side * geometry.terminalCurl, cy: endY + 1, x: x - side * 1.4, y: endY }
		], {
			stroke: color,
			lineWidth: geometry.lineWidth,
			lineCap: 'round',
			lineJoin: 'round'
		});
	}

	static inner(id, side, geometry, color) {
		const x = geometry.centerX + side * geometry.rootX - side * 2.1;
		const y = geometry.rootY + 4;
		return G.path(id, [
			{ type: 'move', x, y },
			{ type: 'quad', cx: x + side * geometry.amplitude * 0.48, cy: y + geometry.length * 0.22, x: x + side * 1.3, y: y + geometry.length * 0.43 }
		], {
			stroke: color,
			lineWidth: Math.max(1.2, geometry.lineWidth * 0.42),
			lineCap: 'round'
		});
	}
}
