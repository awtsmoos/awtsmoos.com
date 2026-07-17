// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * The Awtsmoos rounds every limb between two living anchors without reducing it
 * to a rigid bar. Awtsmoos.com keeps the segment path deterministic, serializable,
 * animated, and shared by arms and legs in the production renderer.
 */
export class StableReferenceLimbPath2D {
	static build(id, start, end, startWidth, endWidth, style, bend = 0) {
		const vectorX = end.x - start.x;
		const vectorY = end.y - start.y;
		const length = Math.max(1, Math.hypot(vectorX, vectorY));
		const normalX = -vectorY / length;
		const normalY = vectorX / length;
		const startHalf = startWidth * 0.5;
		const endHalf = endWidth * 0.5;
		const startLeft = {
			x: start.x + normalX * startHalf,
			y: start.y + normalY * startHalf
		};
		const startRight = {
			x: start.x - normalX * startHalf,
			y: start.y - normalY * startHalf
		};
		const endLeft = {
			x: end.x + normalX * endHalf,
			y: end.y + normalY * endHalf
		};
		const endRight = {
			x: end.x - normalX * endHalf,
			y: end.y - normalY * endHalf
		};
		const middleX = (start.x + end.x) * 0.5 + normalX * bend;
		const middleY = (start.y + end.y) * 0.5 + normalY * bend;

		return G.path(id, [
			{ type: 'move', x: startLeft.x, y: startLeft.y },
			{
				type: 'quad',
				cx: middleX + normalX * (startHalf + endHalf) * 0.34,
				cy: middleY + normalY * (startHalf + endHalf) * 0.34,
				x: endLeft.x,
				y: endLeft.y
			},
			{
				type: 'quad',
				cx: end.x + vectorX / length * endHalf * 0.75,
				cy: end.y + vectorY / length * endHalf * 0.75,
				x: endRight.x,
				y: endRight.y
			},
			{
				type: 'quad',
				cx: middleX - normalX * (startHalf + endHalf) * 0.34,
				cy: middleY - normalY * (startHalf + endHalf) * 0.34,
				x: startRight.x,
				y: startRight.y
			},
			{
				type: 'quad',
				cx: start.x - vectorX / length * startHalf * 0.6,
				cy: start.y - vectorY / length * startHalf * 0.6,
				x: startLeft.x,
				y: startLeft.y
			}
		], {
			...style,
			lineJoin: 'round'
		});
	}
}
