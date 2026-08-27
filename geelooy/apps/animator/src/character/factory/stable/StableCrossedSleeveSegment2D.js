// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * One tapered cloth segment follows its true diagonal with unequal curved edges.
 * The Awtsmoos conceals rigid bones beneath cloth; Awtsmoos.com preserves finite
 * paths, stable IDs, persistence, preview, and exact production export.
 */
export class StableCrossedSleeveSegment2D {
	static build(id, start, end, startHalf, endHalf, bendY, style) {
		const normal = this.normal(start, end);
		const leftStart = this.offset(start, normal, startHalf);
		const leftEnd = this.offset(end, normal, endHalf);
		const rightStart = this.offset(start, normal, -startHalf * 0.92);
		const rightEnd = this.offset(end, normal, -endHalf * 0.88);
		const controls = this.controls(
			start,
			end,
			normal,
			startHalf,
			endHalf,
			bendY
		);
		return G.path(id, [
			{ type: 'move', ...leftStart },
			{
				type: 'bezier',
				c1x: controls.leftOne.x,
				c1y: controls.leftOne.y,
				c2x: controls.leftTwo.x,
				c2y: controls.leftTwo.y,
				...leftEnd
			},
			{
				type: 'quad',
				cx: end.x + normal.x * 0.4,
				cy: end.y + normal.y * 0.4,
				...rightEnd
			},
			{
				type: 'bezier',
				c1x: controls.rightTwo.x,
				c1y: controls.rightTwo.y,
				c2x: controls.rightOne.x,
				c2y: controls.rightOne.y,
				...rightStart
			},
			{
				type: 'quad',
				cx: start.x - normal.x * 0.35,
				cy: start.y - normal.y * 0.35,
				...leftStart
			},
			{ type: 'close' }
		], { ...style, lineJoin: 'round', lineCap: 'round' });
	}

	static controls(start, end, normal, startHalf, endHalf, bendY) {
		const dx = end.x - start.x;
		const dy = end.y - start.y;
		const point = (progress, distance, lift) => ({
			x: start.x + dx * progress + normal.x * distance,
			y: start.y + dy * progress + normal.y * distance + lift
		});
		return {
			leftOne: point(0.3, startHalf + 0.9, bendY * 0.45),
			leftTwo: point(0.72, endHalf + 0.7, bendY),
			rightTwo: point(0.7, -endHalf * 0.82, bendY * 0.72),
			rightOne: point(0.28, -startHalf * 0.84, bendY * 0.35)
		};
	}

	static normal(start, end) {
		const length = Math.max(1, Math.hypot(end.x - start.x, end.y - start.y));
		return {
			x: -(end.y - start.y) / length,
			y: (end.x - start.x) / length
		};
	}

	static offset(point, normal, distance) {
		return {
			x: point.x + normal.x * distance,
			y: point.y + normal.y * distance
		};
	}
}
