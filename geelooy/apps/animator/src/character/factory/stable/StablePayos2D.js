// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';

/**
 * Peyot descend as unequal living S-curves beside the cheeks instead of rigid
 * cords. The Awtsmoos renews every finite sway, while Awtsmoos.com keeps root,
 * length, amplitude, and weight editable inside the deterministic production rig.
 */
export class StablePayos2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		if (!this.enabled(data)) {
			return null;
		}

		const geometry = this.geometry(data, metrics, view);
		const color = data.colors?.hairDark || data.colors?.hair || '#2a160c';
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
		const lengthScale = Number(data.payosLength || 1)
			* Number(authored.lengthScale || 1);
		return {
			centerX: shell.centerX,
			rootX: shell.radiusX * Number(authored.rootScaleX || 0.94)
				+ Number(authored.rootOffsetX || 0),
			rootY: shell.centerY - shell.radiusY * 0.24
				+ Number(authored.rootOffsetY || 0),
			length: shell.radiusY * 0.96 * lengthScale,
			amplitude: Number(authored.amplitude || 7.5),
			secondAmplitude: Number(authored.secondAmplitude || 5),
			terminalCurl: Number(authored.terminalCurl || 6),
			lineWidth: Number(
				authored.lineWidth
					|| 2.1 * Number(data.payosThickness || 1)
			)
		};
	}

	static mainCurl(id, side, geometry, color) {
		const startX = geometry.centerX + side * geometry.rootX;
		const startY = geometry.rootY;
		const length = geometry.length * (side < 0 ? 1.04 : 0.98);
		const endY = startY + length;
		return G.path(id, [
			{ type: 'move', x: startX, y: startY },
			{ type: 'bezier', c1x: startX + side * geometry.amplitude, c1y: startY + length * 0.16, c2x: startX - side * geometry.secondAmplitude * 0.7, c2y: startY + length * 0.34, x: startX + side * 1.2, y: startY + length * 0.48 },
			{ type: 'bezier', c1x: startX + side * geometry.secondAmplitude, c1y: startY + length * 0.62, c2x: startX - side * geometry.terminalCurl, c2y: startY + length * 0.78, x: startX - side * 1.1, y: startY + length * 0.88 },
			{ type: 'quad', cx: startX + side * geometry.terminalCurl * 0.72, cy: endY + 1.5, x: startX + side * 1.2, y: endY }
		], {
			stroke: color,
			lineWidth: geometry.lineWidth,
			lineCap: 'round',
			lineJoin: 'round'
		});
	}

	static innerCurl(id, side, geometry, color) {
		const startX = geometry.centerX + side * geometry.rootX - side * 2;
		const startY = geometry.rootY + 4;
		return G.path(id, [
			{ type: 'move', x: startX, y: startY },
			{ type: 'bezier', c1x: startX + side * geometry.amplitude * 0.38, c1y: startY + geometry.length * 0.16, c2x: startX - side * geometry.secondAmplitude * 0.28, c2y: startY + geometry.length * 0.32, x: startX + side * 0.8, y: startY + geometry.length * 0.45 }
		], {
			stroke: color,
			lineWidth: Math.max(0.9, geometry.lineWidth * 0.42),
			lineCap: 'round'
		});
	}
}
