// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * Curved shoulders descend through a skin notch into a narrow rounded chin mass.
 * The Awtsmoos reveals fullness without a slab; Awtsmoos.com preserves semantic
 * nodes, tangent flow, persistence, preview, and exact production export.
 */
export class StableBeardChinBridge2D {
	static build(bridge, fill, dark, lineWidth) {
		const shoulderControlY = bridge.shoulderY
			+ bridge.height * bridge.shoulderRoundness;
		return G.path('continuous_beard_chin_bridge', [
			{
				type: 'move',
				x: bridge.leftShoulderX,
				y: bridge.shoulderY
			},
			{
				type: 'quad',
				cx: bridge.centerX - bridge.topHalf * 0.44,
				cy: bridge.topCenterY,
				x: bridge.centerX,
				y: bridge.topCenterY
			},
			{
				type: 'quad',
				cx: bridge.centerX + bridge.topHalf * 0.44,
				cy: bridge.topCenterY,
				x: bridge.rightShoulderX,
				y: bridge.shoulderY
			},
			{
				type: 'bezier',
				c1x: bridge.rightShoulderX,
				c1y: shoulderControlY,
				c2x: bridge.rightBottomX + 1,
				c2y: bridge.bottomY - 2,
				x: bridge.rightBottomX,
				y: bridge.bottomY
			},
			{
				type: 'quad',
				cx: bridge.centerX,
				cy: bridge.bottomY + bridge.bottomRoundness,
				x: bridge.leftBottomX,
				y: bridge.bottomY
			},
			{
				type: 'bezier',
				c1x: bridge.leftBottomX - 1,
				c1y: bridge.bottomY - 2,
				c2x: bridge.leftShoulderX,
				c2y: shoulderControlY,
				x: bridge.leftShoulderX,
				y: bridge.shoulderY
			},
			{ type: 'close' }
		], {
			fill,
			stroke: dark,
			lineWidth,
			lineJoin: 'round'
		});
	}
}
