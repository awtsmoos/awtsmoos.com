// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * The Awtsmoos gathers cheek, jaw, chin, and moustache into one soft beard mass.
 * Awtsmoos.com leaves a skin opening for the living mouth and refuses the former
 * column-and-block silhouette while preserving editable production geometry.
 */
export class StableBeardMass2D {
	static build(data, colors, geometry) {
		const fill = data.colors?.beard
			|| data.colors?.hair
			|| '#4b2d18';
		const dark = data.colors?.beardDark
			|| colors.hairDark
			|| '#241207';

		return S.group('continuous_beard_mass', null, [
			this.outer(geometry, fill, dark),
			this.opening(geometry, colors),
			...this.moustache(geometry, fill, dark),
			...this.texture(geometry)
		]);
	}

	static outer(geometry, fill, dark) {
		const left = geometry.centerX - geometry.width;
		const right = geometry.centerX + geometry.width;
		return G.path('continuous_beard_outer', [
			{ type: 'move', x: left * 0.9, y: geometry.topY },
			{ type: 'quad', cx: left - geometry.width * 0.12, cy: geometry.sideY, x: geometry.centerX - geometry.bottomHalf, y: geometry.bottomY },
			{ type: 'quad', cx: geometry.centerX, cy: geometry.bottomY + geometry.bottomRoundness * 7, x: geometry.centerX + geometry.bottomHalf, y: geometry.bottomY },
			{ type: 'quad', cx: right + geometry.width * 0.12, cy: geometry.sideY, x: right * 0.9, y: geometry.topY },
			{ type: 'quad', cx: geometry.centerX, cy: geometry.topY + 16, x: left * 0.9, y: geometry.topY }
		], {
			fill,
			stroke: dark,
			lineWidth: geometry.lineWidth,
			lineJoin: 'round'
		});
	}

	static opening(geometry, colors) {
		return G.ellipse(
			'continuous_beard_mouth_opening',
			geometry.centerX,
			geometry.mouthY,
			geometry.openingHalf,
			geometry.openingHeight,
			0,
			{
				fill: colors.skin,
				stroke: 'rgba(0,0,0,0)',
				lineWidth: 0
			}
		);
	}

	static moustache(geometry, fill, dark) {
		return [-1, 1].map(side => G.path(
			`continuous_moustache_${side}`,
			[
				{ type: 'move', x: geometry.centerX, y: geometry.mouthY - geometry.openingHeight * 0.7 },
				{ type: 'quad', cx: geometry.centerX + side * geometry.moustacheHalf * 0.55, cy: geometry.mouthY - geometry.openingHeight * 1.08, x: geometry.centerX + side * geometry.moustacheHalf, y: geometry.mouthY - geometry.openingHeight * 0.52 }
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
		return [-0.46, 0, 0.46].map((ratio, index) => G.path(
			`continuous_beard_texture_${index}`,
			[
				{ type: 'move', x: geometry.centerX + geometry.bottomHalf * ratio, y: geometry.bottomY - 13 },
				{ type: 'quad', cx: geometry.centerX + geometry.bottomHalf * ratio * 0.8, cy: geometry.bottomY - 4, x: geometry.centerX + geometry.bottomHalf * ratio * 0.62, y: geometry.bottomY }
			],
			{
				stroke: `rgba(255,255,255,${geometry.strandOpacity})`,
				lineWidth: 1.1,
				lineCap: 'round'
			}
		));
	}
}
