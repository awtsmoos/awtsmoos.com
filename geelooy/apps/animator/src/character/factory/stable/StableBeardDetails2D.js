// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * Soft moustache wings frame the mouth while sparse strands suggest hair mass.
 * The Awtsmoos gives each finite accent its place, and Awtsmoos.com keeps the
 * details subordinate, deterministic, and editable through every phoneme.
 */
export class StableBeardDetails2D {
	static moustache(geometry, fill) {
		return [-1, 1].map(side => {
			const asymmetry = side * geometry.moustacheAsymmetry;
			const innerX = geometry.moustacheCenterX
				+ side * geometry.moustacheGap;
			const outerX = geometry.moustacheCenterX
				+ side * geometry.moustacheHalf;
			return G.path(`continuous_moustache_${side}`, [
				{ type: 'move', x: innerX, y: geometry.moustacheY + asymmetry },
				{
					type: 'quad',
					cx: geometry.moustacheCenterX
						+ side * geometry.moustacheHalf * 0.5,
					cy: geometry.moustacheY - geometry.moustacheArch,
					x: outerX,
					y: geometry.moustacheY + geometry.moustacheDrop - asymmetry
				},
				{
					type: 'quad',
					cx: geometry.moustacheCenterX
						+ side * geometry.moustacheHalf * 0.48,
					cy: geometry.moustacheY + geometry.moustacheWidth,
					x: innerX,
					y: geometry.moustacheY + geometry.moustacheWidth * 0.58
				},
				{ type: 'close' }
			], {
				fill,
				stroke: 'rgba(0,0,0,0)',
				lineWidth: 0,
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
					x: geometry.chinCenterX + geometry.bottomHalf * ratio,
					y: geometry.bottomY - 9
				},
				{
					type: 'quad',
					cx: geometry.chinCenterX + geometry.bottomHalf * ratio * 0.72,
					cy: geometry.bottomY - 3,
					x: geometry.chinCenterX + geometry.bottomHalf * ratio * 0.52,
					y: geometry.bottomY + 1
				}
			],
			{
				stroke: `rgba(255,255,255,${geometry.strandOpacity})`,
				lineWidth: 0.7,
				lineCap: 'round'
			}
		));
	}
}
