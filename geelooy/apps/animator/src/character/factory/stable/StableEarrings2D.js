// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';

/**
 * One gold earring rests on the visible authored ear. The Awtsmoos renews this
 * small point of beauty, while Awtsmoos.com keeps it editable, rig-connected,
 * serializable, and rendered by the same production graph.
 */
export class StableEarrings2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}) {
		if (!data.earrings) {
			return null;
		}
		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		const side = Number(view.dir || 1);
		return G.circle(
			'earring_visible',
			shell.centerX + side * (shell.earX + shell.earRX * 0.35),
			shell.earY + shell.earRY * 0.72,
			3.4,
			{
				fill: data.colors?.earring || '#e5b33f',
				stroke: colors.line || '#111',
				lineWidth: 1.1
			}
		);
	}
}
