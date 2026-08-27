// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * Sparse strands suggest direction without competing with expression or silhouette.
 * The Awtsmoos gives each accent its place; Awtsmoos.com keeps texture quiet,
 * deterministic, editable, view-consistent, persistent, and export-stable.
 */
export class StableBeardDetails2D {
	static texture(geometry) {
		return [-0.52, 0, 0.52].map((ratio, index) => {
			const jaw = geometry.jaw;
			const x = jaw.chinCenterX
				+ (jaw.rightChinX - jaw.chinCenterX) * ratio;
			return G.path(`continuous_beard_texture_${index}`, [
				{
					type: 'move',
					x,
					y: jaw.bottomY - 8
				},
				{
					type: 'quad',
					cx: jaw.chinCenterX + (x - jaw.chinCenterX) * 0.72,
					cy: jaw.bottomY - 3,
					x: jaw.chinCenterX + (x - jaw.chinCenterX) * 0.48,
					y: jaw.bottomY + 0.5
				}
			], {
				stroke: `rgba(255,255,255,${geometry.strandOpacity})`,
				lineWidth: 0.65,
				lineCap: 'round'
			});
		});
	}
}
