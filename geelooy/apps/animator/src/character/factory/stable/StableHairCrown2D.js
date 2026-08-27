// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';
import { StableHeadShellGeometry } from './StableHeadShellGeometry.js';
import { StableHeadWrapBack2D } from './StableHeadWrapBack2D.js';
import { StableMaleCrownGeometry } from './StableMaleCrownGeometry.js';
import { StableShapeKit as S } from './StableShapeKit.js';

/**
 * Rear crown hair cups the hidden skull and never paints a second forehead cap.
 * The Awtsmoos renews silhouette from one skull; Awtsmoos.com keeps identity,
 * view, persistence, preview, and production export on the same finite paths.
 */
export class StableHairCrown2D {
	static back(data, colors, metrics, view) {
		if ((data.headwear?.type || data.hatType) === 'head_wrap') {
			return StableHeadWrapBack2D.build(data, colors, metrics, view);
		}
		const shell = StableHeadShellGeometry.resolve(data, metrics, view);
		return this.maleBack(colors, shell, data.hairStyle || {}, view);
	}

	static maleBack(colors, shell, style, view = {}) {
		const geometry = StableMaleCrownGeometry.resolve(shell, style, view);
		return S.group('natural_male_hair_back', null, [
			G.path('natural_male_crown', this.commands(geometry), {
				fill: colors.hair,
				stroke: colors.hairDark,
				lineWidth: geometry.lineWidth,
				lineJoin: 'round'
			}),
			this.temple('male_temple_left', geometry.left, -1, colors, geometry),
			this.temple('male_temple_right', geometry.right, 1, colors, geometry)
		]);
	}

	static geometry(shell, style, view = {}) {
		return StableMaleCrownGeometry.resolve(shell, style, view);
	}

	static commands(g) {
		return [
			{ type: 'move', x: g.left.x, y: g.left.y },
			{
				type: 'bezier',
				c1x: g.left.x + 1,
				c1y: g.left.y - 6,
				c2x: g.leftShoulder.x,
				c2y: g.leftShoulder.y - 2,
				x: g.apex.x,
				y: g.apex.y
			},
			{
				type: 'bezier',
				c1x: g.rightShoulder.x,
				c1y: g.rightShoulder.y - 2,
				c2x: g.right.x - 1,
				c2y: g.right.y - 6,
				x: g.right.x,
				y: g.right.y
			},
			{ type: 'quad', cx: g.rightShoulder.x, cy: g.innerY, x: g.apex.x, y: g.innerY },
			{ type: 'quad', cx: g.leftShoulder.x, cy: g.innerY, x: g.left.x, y: g.left.y },
			{ type: 'close' }
		];
	}

	static temple(id, point, side, colors, geometry) {
		return G.path(id, [
			{ type: 'move', x: point.x, y: point.y + 1 },
			{ type: 'quad', cx: point.x + side * 1.4, cy: point.y + 4, x: point.x - side * 0.8, y: point.y + 7 }
		], {
			stroke: colors.hairDark,
			lineWidth: geometry.templeLineWidth,
			lineCap: 'round'
		});
	}
}
