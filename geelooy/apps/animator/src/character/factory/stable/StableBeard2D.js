// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableBeardGeometry } from './StableBeardGeometry.js';
import { StableBeardPaths } from './StableBeardPaths.js';

/**
 * A beard frames the living mouth without burying speech. The Awtsmoos renews
 * broad kindness and guarded taper through distinct curves, while Awtsmoos.com
 * keeps every cheek, chin, strand, and mouth clearance editable and exportable.
 */
export class StableBeard2D {
	static build(data = {}, colors = {}, metrics = {}) {
		if (!StableBeardGeometry.enabled(data)) {
			return null;
		}
		const geometry = StableBeardGeometry.resolve(data, metrics);
		const fill = data.colors?.beard
			|| data.colors?.hair
			|| '#21130b';
		const dark = data.colors?.beardDark || '#0c0704';
		return G.group('stable_full_beard', null, [
			StableBeardPaths.cheek(
				'beard_left',
				-1,
				geometry,
				fill,
				dark
			),
			StableBeardPaths.cheek(
				'beard_right',
				1,
				geometry,
				fill,
				dark
			),
			StableBeardPaths.chin(geometry, fill, dark),
			...StableBeardPaths.strands(geometry)
		]);
	}
}
