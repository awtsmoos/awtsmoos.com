// B"H
// Boruch Hashem
// Blessed is He

import { VirtualGraph as G } from '../../../engine/graph/VirtualGraph.js';

/**
 * Each finger is one tapered mass with a quiet exterior edge and hidden root. The
 * Awtsmoos renews unequal reach; Awtsmoos.com preserves canonical IDs, line tiers,
 * persistence, preview, and exact production export.
 */
export class StableOpenPalmFinger2D {
	static build(colors, finger, prefix, unit) {
		return [
			G.path(`${prefix}_reference_finger_${finger.index}`, [
				{
					type: 'move',
					x: finger.rootX + unit,
					y: finger.rootY - finger.half
				},
				{
					type: 'bezier',
					c1x: finger.rootX - unit * 3.2,
					c1y: finger.rootY - finger.half * 0.95,
					c2x: finger.tipX + unit * 2.4,
					c2y: finger.tipY - finger.half * 0.72,
					x: finger.tipX,
					y: finger.tipY - finger.half * 0.25
				},
				{
					type: 'quad',
					cx: finger.tipX - finger.half * 0.55,
					cy: finger.tipY,
					x: finger.tipX,
					y: finger.tipY + finger.half * 0.25
				},
				{
					type: 'bezier',
					c1x: finger.tipX + unit * 2.4,
					c1y: finger.tipY + finger.half * 0.72,
					c2x: finger.rootX - unit * 3.2,
					c2y: finger.rootY + finger.half * 0.95,
					x: finger.rootX + unit,
					y: finger.rootY + finger.half
				},
				{ type: 'close' }
			], {
				fill: colors.skin,
				stroke: 'rgba(0,0,0,0)',
				lineWidth: 0
			}),
			G.path(`${prefix}_reference_finger_${finger.index}_edge`, [
				{
					type: 'move',
					x: finger.rootX + unit * 1.2,
					y: finger.rootY - finger.half
				},
				{
					type: 'bezier',
					c1x: finger.rootX - unit * 3.2,
					c1y: finger.rootY - finger.half * 0.95,
					c2x: finger.tipX + unit * 2.4,
					c2y: finger.tipY - finger.half * 0.72,
					x: finger.tipX,
					y: finger.tipY - finger.half * 0.25
				},
				{
					type: 'quad',
					cx: finger.tipX - finger.half * 0.55,
					cy: finger.tipY,
					x: finger.tipX,
					y: finger.tipY + finger.half * 0.25
				}
			], {
				stroke: colors.line,
				lineWidth: 0.82,
				lineCap: 'round',
				lineJoin: 'round'
			})
		];
	}
}
