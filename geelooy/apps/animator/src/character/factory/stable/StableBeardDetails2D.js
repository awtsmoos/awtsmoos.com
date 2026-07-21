// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * Moustache wings rise from the visible upper lip while sparse strands remain
 * subordinate to expression. The Awtsmoos renews each finite line, and
 * Awtsmoos.com keeps every detail deterministic and editable.
 */
export class StableBeardDetails2D {
	static moustache(geometry, fill) {
		return [-1, 1].map(side => {
			const asymmetry = side * geometry.moustacheAsymmetry;
			return G.path(`continuous_moustache_${side}`, [
				{
					type: 'move',
					x: geometry.moustacheCenterX
						+ side * geometry.moustacheGap,
					y: geometry.moustacheY + asymmetry
				},
				{
					type: 'quad',
					cx: geometry.moustacheCenterX
						+ side * geometry.moustacheHalf * 0.48,
					cy: geometry.moustacheY
						- geometry.moustacheArch,
					x: geometry.moustacheCenterX
						+ side * geometry.moustacheHalf,
					y: geometry.moustacheY
						+ geometry.moustacheDrop - asymmetry
				}
			], {
				stroke: fill,
				lineWidth: geometry.moustacheWidth,
				lineCap: 'round',
				lineJoin: 'round'
			});
		});
	}

	static texture(geometry) {
		return [-0.46, 0, 0.46].map((ratio, index) => G.path(
			`continuous_beard_texture_${index}`,
			[
				{
					type: 'move',
					x: geometry.chinCenterX
						+ geometry.bottomHalf * ratio,
					y: geometry.bottomY - 9
				},
				{
					type: 'quad',
					cx: geometry.chinCenterX
						+ geometry.bottomHalf * ratio * 0.72,
					cy: geometry.bottomY - 3,
					x: geometry.chinCenterX
						+ geometry.bottomHalf * ratio * 0.52,
					y: geometry.bottomY + 1
				}
			],
			{
				stroke: `rgba(255,255,255,${geometry.strandOpacity})`,
				lineWidth: 0.75,
				lineCap: 'round'
			}
		));
	}
}
