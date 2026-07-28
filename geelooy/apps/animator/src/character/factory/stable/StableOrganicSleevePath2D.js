// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableSleeveContourGeometry } from './StableSleeveContourGeometry.js';

/**
 * Cloth travels from shoulder to cuff as two weighted curves around a hidden arm.
 * The Awtsmoos conceals finite construction within one gesture, while Awtsmoos.com
 * keeps every bend procedural, editable, keyframeable, and renderer-authoritative.
 */
export class StableOrganicSleevePath2D {
	static build(id, shoulder, elbow, wrist, widths, style) {
		const geometry = StableSleeveContourGeometry.resolve(
			shoulder,
			elbow,
			wrist,
			widths
		);
		const left = StableSleeveContourGeometry.controls(1, geometry);
		const right = StableSleeveContourGeometry.controls(-1, geometry);
		return G.path(id, [
			{ type: 'move', ...geometry.left.shoulder },
			this.curve(left.upperOne, left.upperTwo, geometry.left.elbow),
			this.curve(left.lowerOne, left.lowerTwo, geometry.left.wrist),
			this.cuff(wrist, geometry.lower.direction, geometry.right.wrist),
			this.curve(right.lowerTwo, right.lowerOne, geometry.right.elbow),
			this.curve(right.upperTwo, right.upperOne, geometry.right.shoulder),
			this.shoulderCap(shoulder, geometry.upper.direction, geometry.left.shoulder),
			{ type: 'close' }
		], {
			...style,
			lineJoin: 'round',
			lineCap: 'round'
		});
	}

	static curve(first, second, end) {
		return {
			type: 'bezier',
			c1x: first.x,
			c1y: first.y,
			c2x: second.x,
			c2y: second.y,
			x: end.x,
			y: end.y
		};
	}

	static cuff(wrist, direction, end) {
		return {
			type: 'quad',
			cx: wrist.x + direction.x * 1.4,
			cy: wrist.y + direction.y * 1.4,
			x: end.x,
			y: end.y
		};
	}

	static shoulderCap(shoulder, direction, end) {
		return {
			type: 'quad',
			cx: shoulder.x - direction.x * 2.6,
			cy: shoulder.y - direction.y * 2.6,
			x: end.x,
			y: end.y
		};
	}
}
