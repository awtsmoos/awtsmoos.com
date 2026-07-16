// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * The Awtsmoos reveals a beard as cheeks, chin, and flowing strands, leaving
 * the mouth alive for dialogue and visemes instead of hiding it under one mass.
 */
export class StableBeard2D {
	static build(data = {}, colors = {}, metrics = {}) {
		if (!(data.beard || data.archetype === 'sage' || data.style === 'goal_board_sage')) {
			return null;
		}
		const fill = data.colors?.beard || data.colors?.hair || '#21130b';
		const dark = data.colors?.beardDark || '#0c0704';
		const length = Number(data.beardLength || 0.72);
		const top = metrics.headY + 6;
		const mouthY = metrics.headY + 28;
		const bottom = metrics.headY + 52 + 45 * length;
		const cheek = metrics.headRX * 0.68;
		return G.group('stable_full_beard', null, [
			this.cheek('beard_left', -1, cheek, top, mouthY, bottom, fill, dark),
			this.cheek('beard_right', 1, cheek, top, mouthY, bottom, fill, dark),
			G.path('beard_chin', [
				{ type: 'move', x: -18, y: mouthY + 12 },
				{ type: 'quad', cx: -24, cy: bottom - 10, x: 0, y: bottom },
				{ type: 'quad', cx: 24, cy: bottom - 10, x: 18, y: mouthY + 12 },
				{ type: 'quad', cx: 0, cy: mouthY + 22, x: -18, y: mouthY + 12 }
			], { fill, stroke: dark, lineWidth: 2.2, lineJoin: 'round' }),
			...[-14, -7, 0, 7, 14].map((x, index) => G.path(`beard_strand_${index}`, [
				{ type: 'move', x, y: mouthY + 18 },
				{ type: 'quad', cx: x * 0.55, cy: bottom - 10, x: x * 0.25, y: bottom - 3 }
			], { stroke: 'rgba(255,255,255,.10)', lineWidth: 1.15, lineCap: 'round' }))
		]);
	}

	static cheek(id, side, cheek, top, mouthY, bottom, fill, dark) {
		return G.path(id, [
			{ type: 'move', x: side * cheek, y: top },
			{ type: 'quad', cx: side * (cheek + 8), cy: mouthY + 20, x: side * 22, y: bottom - 8 },
			{ type: 'line', x: side * 10, y: mouthY + 10 },
			{ type: 'quad', cx: side * 24, cy: mouthY - 2, x: side * cheek, y: top }
		], { fill, stroke: dark, lineWidth: 2.2, lineJoin: 'round' });
	}
}
