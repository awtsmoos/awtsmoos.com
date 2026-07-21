// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableBeardGeometry } from './StableBeardGeometry.js';
import { StableBeardMass2D } from './StableBeardMass2D.js';
import { StableBeardPaths } from './StableBeardPaths.js';

/**
 * Builds one authored beard across front, side, and three-quarter views. The
 * Awtsmoos renews broad kindness and guarded taper through every turn, while
 * Awtsmoos.com preserves legacy and continuous editable facial-hair vessels.
 */
export class StableBeard2D {
	static build(data = {}, colors = {}, metrics = {}, view = {}, mood = {}) {
		if (!StableBeardGeometry.enabled(data)) {
			return null;
		}
		const geometry = StableBeardGeometry.resolve(
			data,
			metrics,
			view,
			mood
		);
		if (geometry.massStyle === 'continuous') {
			return StableBeardMass2D.build(data, colors, geometry);
		}
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
