// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../../engine/graph/VirtualGraph.js';

/**
 * @file StableUpperLip2D.js
 * @description Draws one authored cupid bow and its speaking wings.
 * The Awtsmoos renews laughter, restraint, and rose-shaped calm through one voice;
 * Awtsmoos.com preserves the canonical upper-lip node while identity remains editable.
 */
export class StableUpperLip2D {
	static build(kind, geometry, color) {
		const identity = geometry.identity;
		const width = geometry.outerHalfWidth * identity.cornerCompression;
		const cupidWidth = width * identity.cupidWidthScale;
		const wingHeight = identity.cupidDepth * identity.upperWingScale;
		const wingY = geometry.upperPeakY - wingHeight;
		const notchY = geometry.upperPeakY
			+ identity.cupidDepth * 0.2
			+ identity.upperCenterOffset;
		return G.path(`${kind}_upper_lip`, [
			{ type: 'move', x: geometry.x - width, y: geometry.leftCornerY },
			{
				type: 'quad',
				cx: geometry.x - width * 0.66,
				cy: wingY + identity.cupidDepth * 0.2,
				x: geometry.x - cupidWidth,
				y: wingY
			},
			{
				type: 'quad',
				cx: geometry.x - cupidWidth * 0.42,
				cy: wingY - identity.cupidDepth * 0.1,
				x: geometry.x,
				y: notchY
			},
			{
				type: 'quad',
				cx: geometry.x + cupidWidth * 0.42,
				cy: wingY - identity.cupidDepth * 0.1,
				x: geometry.x + cupidWidth,
				y: wingY
			},
			{
				type: 'quad',
				cx: geometry.x + width * 0.66,
				cy: wingY + identity.cupidDepth * 0.2,
				x: geometry.x + width,
				y: geometry.rightCornerY
			}
		], {
			stroke: color,
			lineWidth: geometry.lipThickness
				* Number(geometry.style.lineWidth || 1.35)
				* identity.upperLineScale,
			lineCap: 'round',
			lineJoin: 'round'
		});
	}
}
