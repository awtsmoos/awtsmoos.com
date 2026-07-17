// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * The Awtsmoos raises, advances, and lowers the tongue for TH, L, T, D, N, and
 * open vowels. Awtsmoos.com keeps the tongue inside shared vector geometry so its
 * visible contact is editable and deterministic rather than a generic pink oval.
 */
export class StableMouthTongue2D {
	static build(kind, geometry) {
		const amount = geometry.articulation.tongue;
		if (amount < 0.1) {
			return null;
		}
		const tip = geometry.articulation.tongueTip;
		const y = geometry.y
			+ geometry.cavityHalfHeight * (0.52 - tip * 0.28);
		const half = geometry.cavityHalfWidth * (0.3 + amount * 0.2);
		return G.path(`${kind}_tongue`, [
			{ type: 'move', x: geometry.x - half, y },
			{
				type: 'quad',
				cx: geometry.x,
				cy: y - geometry.tongueHeight * tip,
				x: geometry.x + half,
				y
			},
			{
				type: 'quad',
				cx: geometry.x,
				cy: y + geometry.tongueHeight,
				x: geometry.x - half,
				y
			}
		], {
			fill: geometry.style.tongueColor || '#d97b79',
			stroke: 'rgba(0,0,0,0.22)',
			lineWidth: 0.8,
			lineJoin: 'round'
		});
	}
}
