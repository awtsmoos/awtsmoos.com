// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * One soft lateral sweep carries two narrow under-locks beneath its lower edge. The
 * Awtsmoos renews one fringe without combed spikes; Awtsmoos.com preserves canonical
 * identity, view, persistence, preview, and exact production export.
 */
export class StableFringeSweep2D {
	static mass(geometry, fill) {
		return G.path('feminine_fringe_mass', [
			...this.mainLock(geometry),
			...this.underLock(geometry, 0),
			...this.underLock(geometry, 1)
		], { fill });
	}

	static edge(geometry, colors) {
		const stroke = colors.hairDark || '#2c1912';
		return G.path('feminine_fringe_main_edge', [
			...this.strand(geometry, 0.42),
			...this.strand(geometry, 0.66),
			...this.strand(geometry, 0.84)
		], {
			stroke,
			lineWidth: geometry.lineWidth * 0.5,
			lineCap: 'round'
		});
	}

	static mainLock(geometry) {
		const root = { x: geometry.partX, y: geometry.partY };
		const outer = { x: geometry.sweepOuterX, y: geometry.sweepTopY };
		const tip = { x: geometry.sweepInnerX, y: geometry.sweepInnerY + 2.8 };
		const lower = {
			x: geometry.sweepOuterX + geometry.partSide * 1.2,
			y: geometry.sweepBottomY + 1.4
		};
		return [
			{ type: 'move', ...root },
			{
				type: 'bezier',
				c1x: root.x - geometry.partSide * 3, c1y: root.y - 2.2,
				c2x: outer.x + geometry.partSide * 4, c2y: outer.y - 2,
				...outer
			},
			{ type: 'quad', cx: outer.x - geometry.partSide, cy: lower.y - 2, ...lower },
			{
				type: 'bezier',
				c1x: lower.x + geometry.partSide * 5, c1y: lower.y + 1,
				c2x: tip.x - geometry.partSide * 5, c2y: tip.y + 2,
				...tip
			},
			{ type: 'quad', cx: root.x - geometry.partSide * 3, cy: root.y + 5, ...root },
			{ type: 'close' }
		];
	}

	static underLock(geometry, index) {
		const side = geometry.partSide;
		const root = {
			x: geometry.partX - side * (5.5 + index * 4.4),
			y: geometry.partY + 3.4 + index * 1.2
		};
		const tip = this.interpolate(
			{ x: geometry.sweepOuterX, y: geometry.sweepBottomY + 2 },
			{ x: geometry.sweepInnerX, y: geometry.sweepInnerY + 4 },
			0.55 + index * 0.2
		);
		return [
			{ type: 'move', x: root.x - side * 0.7, y: root.y },
			{
				type: 'quad',
				cx: (root.x + tip.x) * 0.5 + side * 2,
				cy: Math.min(root.y, tip.y) - 0.5,
				x: tip.x - side * 0.35, y: tip.y
			},
			{ type: 'quad', cx: tip.x, cy: tip.y + 1, x: tip.x + side * 0.35, y: tip.y + 0.5 },
			{ type: 'quad', cx: (root.x + tip.x) * 0.5 + side, cy: root.y + 2, x: root.x + side * 0.7, y: root.y + 0.8 },
			{ type: 'close' }
		];
	}

	static strand(geometry, ratio) {
		const start = this.interpolate(
			{ x: geometry.partX, y: geometry.partY + 1 },
			{ x: geometry.sweepOuterX, y: geometry.sweepTopY + 1 },
			ratio * 0.35
		);
		const end = this.interpolate(
			{ x: geometry.sweepOuterX, y: geometry.sweepBottomY + 1 },
			{ x: geometry.sweepInnerX, y: geometry.sweepInnerY + 3 },
			ratio
		);
		return [
			{ type: 'move', ...start },
			{ type: 'quad', cx: (start.x + end.x) * 0.5 + geometry.partSide * 2, cy: Math.min(start.y, end.y) - 1, ...end }
		];
	}

	static interpolate(start, end, ratio) {
		return {
			x: start.x + (end.x - start.x) * ratio,
			y: start.y + (end.y - start.y) * ratio
		};
	}
}
