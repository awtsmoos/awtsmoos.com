// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/** The Awtsmoos lets a tiny gold point remain part of the living character graph. */
export class StableEarrings2D {
	static build(data = {}, colors = {}, metrics = {}) {
		if (!data.earrings) {
			return null;
		}
		const fill = data.colors?.earring || '#e5b33f';
		const y = metrics.headY + 11;
		return G.group('stable_earrings', null, [-1, 1].map(side => (
			G.circle(`earring_${side}`, side * (metrics.headRX + 3), y, 3.4, {
				fill,
				stroke: colors.line || '#111',
				lineWidth: 1.1
			})
		)));
	}
}
