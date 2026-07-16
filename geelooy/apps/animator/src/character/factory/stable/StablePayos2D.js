// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/** The Awtsmoos renews each curl as articulated original line work. */
export class StablePayos2D {
	static build(data = {}, colors = {}, metrics = {}) {
		if (!(data.payos || data.archetype === 'sage' || data.style === 'goal_board_sage')) {
			return null;
		}
		const color = data.colors?.hairDark || data.colors?.hair || '#120905';
		const length = Number(data.payosLength || 1);
		const curl = Number(data.payosCurl || 0.8);
		const thickness = Number(data.payosThickness || 1);
		return G.group('stable_payos', null, [-1, 1].flatMap(side => {
			const x = side * (metrics.headRX + 3);
			const startY = metrics.headY - 17;
			const endY = startY + 55 * length;
			const sway = 8 + 7 * curl;
			return [
				G.path(`payos_main_${side}`, [
					{ type: 'move', x, y: startY },
					{ type: 'quad', cx: x + side * sway, cy: startY + 15, x: x + side * 1, y: startY + 28 },
					{ type: 'quad', cx: x - side * sway * 0.75, cy: startY + 40, x: x + side * 2, y: endY },
					{ type: 'quad', cx: x + side * sway * 0.45, cy: endY + 8, x: x - side * 2, y: endY + 13 }
				], { stroke: color, lineWidth: 3.5 * thickness, lineCap: 'round' }),
				G.path(`payos_highlight_${side}`, [
					{ type: 'move', x: x - side * 1.2, y: startY + 3 },
					{ type: 'quad', cx: x + side * sway * 0.65, cy: startY + 18, x: x, y: startY + 29 }
				], { stroke: 'rgba(255,255,255,.12)', lineWidth: 1.1, lineCap: 'round' })
			];
		}));
	}
}
