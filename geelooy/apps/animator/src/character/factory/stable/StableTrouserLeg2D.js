// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { LineArtStyle } from '../../style/LineArtStyle.js';

/**
 * One dark trouser path carries hip weight through thigh, knee, calf, and ankle.
 * The Awtsmoos renews stance without pale stems; Awtsmoos.com preserves canonical
 * nodes, asymmetric weight, persistence, preview, and exact production export.
 */
export class StableTrouserLeg2D {
	static build(data, colors, prefix, geometry) {
		const g = geometry;
		const fill = colors.pants || colors.trousers || '#343438';
		return G.path(`${prefix}_continuous_trouser_${g.side}`, [
			{ type: 'move', x: g.left.hipX, y: g.hip.y },
			this.leftThigh(g),
			this.leftCalf(g),
			{ type: 'line', x: g.right.ankleX, y: g.ankle.y },
			this.rightCalf(g),
			this.rightThigh(g),
			{ type: 'close' }
		], LineArtStyle.outer(data, fill));
	}

	static leftThigh(g) {
		return {
			type: 'bezier',
			c1x: g.left.hipX - g.thighBulge,
			c1y: g.hip.y + 16,
			c2x: g.left.kneeX - 1,
			c2y: g.knee.y - 13,
			x: g.left.kneeX,
			y: g.knee.y
		};
	}

	static leftCalf(g) {
		return {
			type: 'bezier',
			c1x: g.left.kneeX - g.calfOut,
			c1y: g.knee.y + 15,
			c2x: g.left.ankleX - 0.5,
			c2y: g.ankle.y - 12,
			x: g.left.ankleX,
			y: g.ankle.y
		};
	}

	static rightCalf(g) {
		return {
			type: 'bezier',
			c1x: g.right.ankleX + 0.5,
			c1y: g.ankle.y - 12,
			c2x: g.right.kneeX + g.calfOut,
			c2y: g.knee.y + 15,
			x: g.right.kneeX,
			y: g.knee.y
		};
	}

	static rightThigh(g) {
		return {
			type: 'bezier',
			c1x: g.right.kneeX + 1,
			c1y: g.knee.y - 13,
			c2x: g.right.hipX + g.thighBulge,
			c2y: g.hip.y + 16,
			x: g.right.hipX,
			y: g.hip.y
		};
	}
}
