// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file StableLowerLip2D.js
 * @description Draws one authored lower-lip bowl beneath living speech.
 * The Awtsmoos renews fullness without heaviness; Awtsmoos.com preserves the canonical
 * lower-lip node while Ari, Dovid, and Miriam retain independent finite anatomy.
 */
export class StableLowerLip2D {
	static build(kind, geometry, color) {
		const identity = geometry.identity;
		const width = geometry.outerHalfWidth
			* identity.cornerCompression
			* identity.lowerCornerScale
			* (0.88 + geometry.purse * 0.02);
		const lowerY = geometry.lowerPeakY
			- geometry.biteLift
			+ identity.lowerCenterOffset;
		const bowlY = lowerY
			+ geometry.lipThickness * identity.lowerBowlScale;
		return G.path(`${kind}_lower_lip`, [
			{
				type: 'move',
				x: geometry.x - width,
				y: geometry.leftCornerY + 1
			},
			{
				type: 'quad',
				cx: geometry.x - width * 0.42,
				cy: bowlY,
				x: geometry.x,
				y: bowlY + geometry.lipThickness * 0.1
			},
			{
				type: 'quad',
				cx: geometry.x + width * 0.42,
				cy: bowlY,
				x: geometry.x + width,
				y: geometry.rightCornerY + 1
			}
		], {
			stroke: color,
			lineWidth: geometry.lipThickness
				* Number(geometry.style.lowerLipWidth || 1.15)
				* identity.lowerLineScale,
			lineCap: 'round',
			lineJoin: 'round'
		});
	}
}
