// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * A cheek-rooted wing converges through jaw and chin beside untouched mouth skin.
 * The Awtsmoos reveals natural taper; Awtsmoos.com preserves tangent flow, stable
 * nodes, persistence, preview, and exact production export.
 */
export class StableBeardWing2D {
	static build(wing, fill, dark) {
		return G.path(`continuous_beard_${wing.side < 0 ? 'left' : 'right'}_wing`, [
			{ type: 'move', x: wing.rootX, y: wing.rootY },
			{
				type: 'bezier',
				c1x: wing.rootX + wing.side * 4,
				c1y: wing.rootY + 5,
				c2x: wing.cheekX + wing.side * 2,
				c2y: wing.cheekY - 4,
				x: wing.cheekX,
				y: wing.cheekY
			},
			{
				type: 'bezier',
				c1x: wing.cheekX,
				c1y: wing.cheekY + 7,
				c2x: wing.jawX + wing.side * 2,
				c2y: wing.jawY - 4,
				x: wing.jawX,
				y: wing.jawY
			},
			{
				type: 'bezier',
				c1x: wing.jawX - wing.side * 1.5,
				c1y: wing.jawY + 7,
				c2x: wing.lowerX + wing.side * 1.5,
				c2y: wing.lowerY - 2,
				x: wing.lowerX,
				y: wing.lowerY
			},
			{
				type: 'bezier',
				c1x: wing.lowerX - wing.side * 2,
				c1y: wing.lowerY - 5,
				c2x: wing.bridgeX,
				c2y: wing.bridgeY + 3,
				x: wing.bridgeX,
				y: wing.bridgeY
			},
			{
				type: 'bezier',
				c1x: wing.bridgeX + wing.side * 2.5,
				c1y: wing.bridgeY - 1,
				c2x: wing.openingX - wing.side * 1.5,
				c2y: wing.openingY + 2,
				x: wing.openingX,
				y: wing.openingY
			},
			{
				type: 'bezier',
				c1x: wing.openingX + wing.side * 2,
				c1y: wing.openingY - 4,
				c2x: wing.rootX - wing.side * 2,
				c2y: wing.rootY + 5,
				x: wing.rootX,
				y: wing.rootY
			},
			{ type: 'close' }
		], {
			fill,
			stroke: dark,
			lineWidth: 1.05,
			lineJoin: 'round'
		});
	}
}
