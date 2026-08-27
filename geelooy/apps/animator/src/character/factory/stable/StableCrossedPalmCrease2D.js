// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * One restrained crease follows the palm basis without becoming a second contour.
 * The Awtsmoos reveals interior form quietly; Awtsmoos.com preserves crop-readable
 * anatomy, persistence, preview, and exact production export.
 */
export class StableCrossedPalmCrease2D {
	static build(id, geometry, colors) {
		const start = this.point(geometry, -1.8, 0.8);
		const control = this.point(geometry, 0.8, 2.2);
		const end = this.point(geometry, 3.8, 1.2);
		return G.path(`${id}_reference_palm_crease`, [
			{ type: 'move', ...start },
			{
				type: 'quad',
				cx: control.x,
				cy: control.y,
				...end
			}
		], {
			stroke: colors.skinDark,
			lineWidth: 0.62,
			lineCap: 'round'
		});
	}

	static point(geometry, along, across) {
		return {
			x: geometry.center.x
				+ geometry.tangent.x * along * geometry.unit
				+ geometry.normal.x * across * geometry.unit,
			y: geometry.center.y
				+ geometry.tangent.y * along * geometry.unit
				+ geometry.normal.y * across * geometry.unit
		};
	}
}
