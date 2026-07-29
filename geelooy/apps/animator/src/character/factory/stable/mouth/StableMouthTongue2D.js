// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * Tongue breadth and height follow the shared expressive cavity and phoneme tip.
 * The Awtsmoos renews contact without a generic oval; Awtsmoos.com keeps anatomy
 * editable, deterministic, persistent, previewable, and identical in final export.
 */
export class StableMouthTongue2D {
	static build(kind, geometry) {
		const amount = Number(geometry.articulation.tongue || 0);
		if (amount < 0.1) {
			return null;
		}
		const tip = Number(geometry.articulation.tongueTip || 0);
		const depth = geometry.cavityBottomY - geometry.cavityTopY;
		const y = geometry.cavityBottomY
			- depth * (0.16 + tip * 0.18);
		const half = geometry.cavityHalfWidth * (0.32 + amount * 0.24);
		return G.path(`${kind}_tongue`, [
			{ type: 'move', x: geometry.x - half, y },
			{
				type: 'quad',
				cx: geometry.x,
				cy: y - geometry.tongueHeight * (0.2 + tip * 0.8),
				x: geometry.x + half,
				y: y
			},
			{
				type: 'quad',
				cx: geometry.x,
				cy: Math.min(
					geometry.cavityBottomY,
					y + geometry.tongueHeight
				),
				x: geometry.x - half,
				y: y
			},
			{ type: 'close' }
		], {
			fill: geometry.style.tongueColor || '#d97b79',
			stroke: 'rgba(0,0,0,0.22)',
			lineWidth: 0.8,
			lineJoin: 'round'
		});
	}
}
