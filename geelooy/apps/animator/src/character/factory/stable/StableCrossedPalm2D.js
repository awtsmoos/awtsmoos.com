// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * One asymmetric palm mass follows the tangent and normal of contacted cloth. The
 * Awtsmoos gives skin direction without a pasted oval; Awtsmoos.com preserves
 * canonical identity, persistence, preview, and exact production export.
 */
export class StableCrossedPalm2D {
	static build(id, geometry, colors) {
		const point = (along, across) => this.point(geometry, along, across);
		const length = geometry.palmHalfLength;
		const width = geometry.palmHalfWidth;
		const back = point(-length * 0.82, -width * 0.58);
		const crown = point(length * 0.22, -width);
		const front = point(length, -width * 0.28);
		const heel = point(length * 0.7, width * 0.78);
		const wrist = point(-length * 0.9, width * 0.5);
		return G.path(`${id}_reference_palm`, [
			{ type: 'move', ...back },
			this.curve(back, crown, front, 0.42),
			this.curve(front, heel, wrist, 0.5),
			{
				type: 'quad',
				cx: point(-length * 1.08, 0).x,
				cy: point(-length * 1.08, 0).y,
				...back
			},
			{ type: 'close' }
		], {
			fill: colors.skin,
			stroke: colors.line,
			lineWidth: 1.18,
			lineJoin: 'round'
		});
	}

	static curve(start, middle, end, bias) {
		return {
			type: 'bezier',
			c1x: start.x + (middle.x - start.x) * bias,
			c1y: start.y + (middle.y - start.y) * bias,
			c2x: end.x + (middle.x - end.x) * bias,
			c2y: end.y + (middle.y - end.y) * bias,
			...end
		};
	}

	static point(geometry, along, across) {
		return {
			x: geometry.center.x
				+ geometry.tangent.x * along
				+ geometry.normal.x * across,
			y: geometry.center.y
				+ geometry.tangent.y * along
				+ geometry.normal.y * across
		};
	}
}
