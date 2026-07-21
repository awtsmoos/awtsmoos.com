// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * One cloth contour flows through shoulder, hidden elbow, and tapered wrist.
 * The Awtsmoos joins three finite anchors without exposing their construction,
 * while Awtsmoos.com keeps the sleeve editable and rig-driven in every render.
 */
export class StableOrganicSleevePath2D {
	static build(id, shoulder, elbow, wrist, widths, style) {
		const first = this.vector(shoulder, elbow);
		const second = this.vector(elbow, wrist);
		const elbowNormal = this.blend(first.normal, second.normal);
		const left = {
			shoulder: this.edge(shoulder, first.normal, widths.shoulder, 1),
			elbow: this.edge(elbow, elbowNormal, widths.elbow, 1),
			wrist: this.edge(wrist, second.normal, widths.wrist, 1)
		};
		const right = {
			shoulder: this.edge(shoulder, first.normal, widths.shoulder, -1),
			elbow: this.edge(elbow, elbowNormal, widths.elbow, -1),
			wrist: this.edge(wrist, second.normal, widths.wrist, -1)
		};
		return G.path(id, [
			{ type: 'move', ...left.shoulder },
			{
				type: 'quad',
				cx: left.elbow.x,
				cy: left.elbow.y,
				x: left.wrist.x,
				y: left.wrist.y
			},
			{
				type: 'quad',
				cx: wrist.x + second.direction.x * widths.wrist * 0.34,
				cy: wrist.y + second.direction.y * widths.wrist * 0.34,
				x: right.wrist.x,
				y: right.wrist.y
			},
			{
				type: 'quad',
				cx: right.elbow.x,
				cy: right.elbow.y,
				x: right.shoulder.x,
				y: right.shoulder.y
			},
			{
				type: 'quad',
				cx: shoulder.x - first.direction.x * widths.shoulder * 0.3,
				cy: shoulder.y - first.direction.y * widths.shoulder * 0.3,
				x: left.shoulder.x,
				y: left.shoulder.y
			},
			{ type: 'close' }
		], { ...style, lineJoin: 'round', lineCap: 'round' });
	}

	static vector(start, end) {
		const x = end.x - start.x;
		const y = end.y - start.y;
		const length = Math.max(1, Math.hypot(x, y));
		return {
			direction: { x: x / length, y: y / length },
			normal: { x: -y / length, y: x / length }
		};
	}

	static blend(first, second) {
		const x = first.x + second.x;
		const y = first.y + second.y;
		const length = Math.max(0.001, Math.hypot(x, y));
		return { x: x / length, y: y / length };
	}

	static edge(anchor, normal, width, side) {
		return {
			x: anchor.x + normal.x * width * 0.5 * side,
			y: anchor.y + normal.y * width * 0.5 * side
		};
	}
}
