// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * Open stroked wings frame the upper lip without becoming filled mechanical wedges.
 * The Awtsmoos renews hair around voice; Awtsmoos.com preserves canonical node
 * identities, semantic line weight, preview, persistence, and exact export.
 */
export class StableMoustache2D {
	static build(geometry, color) {
		return [-1, 1].map(side => this.wing(side, geometry, color));
	}

	static wing(side, geometry, color) {
		const shift = side * geometry.asymmetry;
		const innerX = geometry.centerX + side * geometry.gap;
		const outerX = geometry.centerX + side * geometry.half;
		return G.path(`continuous_moustache_${side}`, [
			{
				type: 'move',
				x: innerX,
				y: geometry.baseY + shift
			},
			{
				type: 'bezier',
				c1x: geometry.centerX + side * geometry.half * 0.28,
				c1y: geometry.baseY - geometry.arch + shift,
				c2x: geometry.centerX + side * geometry.half * 0.72,
				c2y: geometry.baseY - geometry.arch * 0.45 - shift,
				x: outerX,
				y: geometry.baseY + geometry.drop - shift
			},
			{
				type: 'quad',
				cx: outerX + side * geometry.outerCurl,
				cy: geometry.baseY + geometry.drop + geometry.outerCurl,
				x: outerX - side * geometry.outerCurl * 0.35,
				y: geometry.baseY + geometry.drop * 0.72 - shift
			}
		], {
			stroke: color,
			lineWidth: geometry.thickness * geometry.lineTier,
			lineCap: 'round',
			lineJoin: 'round'
		});
	}
}
