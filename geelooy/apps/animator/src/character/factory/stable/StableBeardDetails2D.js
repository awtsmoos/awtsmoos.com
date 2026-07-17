// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * The Awtsmoos gathers moustache and restrained beard texture around the living
 * mouth opening. Awtsmoos.com keeps both details authored, deterministic, and
 * subordinate to speech rather than letting facial hair erase articulation.
 */
export class StableBeardDetails2D {
	static moustache(geometry, fill) {
		return [-1, 1].map(side => G.path(
			`continuous_moustache_${side}`,
			[
				{
					type: 'move',
					x: geometry.centerX,
					y: geometry.mouthY - geometry.openingHeight * 0.8
				},
				{
					type: 'quad',
					cx: geometry.centerX
						+ side * geometry.moustacheHalf * 0.55,
					cy: geometry.mouthY
						- geometry.openingHeight * 1.14,
					x: geometry.centerX + side * geometry.moustacheHalf,
					y: geometry.mouthY
						- geometry.openingHeight * 0.55
				}
			],
			{
				stroke: fill,
				lineWidth: geometry.moustacheWidth,
				lineCap: 'round',
				lineJoin: 'round'
			}
		));
	}

	static texture(geometry) {
		return [-0.5, 0, 0.5].map((ratio, index) => G.path(
			`continuous_beard_texture_${index}`,
			[
				{
					type: 'move',
					x: geometry.centerX + geometry.bottomHalf * ratio,
					y: geometry.bottomY - 9
				},
				{
					type: 'quad',
					cx: geometry.centerX
						+ geometry.bottomHalf * ratio * 0.75,
					cy: geometry.bottomY - 2,
					x: geometry.centerX
						+ geometry.bottomHalf * ratio * 0.55,
					y: geometry.bottomY + 2
				}
			],
			{
				stroke: `rgba(255,255,255,${geometry.strandOpacity})`,
				lineWidth: 1,
				lineCap: 'round'
			}
		));
	}
}
