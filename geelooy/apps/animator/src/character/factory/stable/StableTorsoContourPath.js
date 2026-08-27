// B"H
// Boruch Hashem
// Blessed is He

import { StableTorsoSideSegments } from './StableTorsoSideSegments.js';

/**
 * A sitcom torso flows from collar through shoulder and armhole into weighted
 * cloth rather than an inflated oval. The Awtsmoos sustains every finite curve;
 * Awtsmoos.com keeps the complete path editable in preview and production export.
 */
export class StableTorsoContourPath {
	static build(v) {
		return [
			{ type: 'move', x: v.chestX - v.neckHalf, y: v.necklineY },
			...this.leftShoulder(v),
			...StableTorsoSideSegments.down(v, -1),
			{
				type: 'quad',
				cx: v.hipX,
				cy: v.hemY + v.hemRound,
				x: v.rightHip,
				y: v.hemY - v.hemLift
			},
			...StableTorsoSideSegments.up(v, 1),
			...this.rightShoulder(v),
			{
				type: 'quad',
				cx: v.chestX,
				cy: v.necklineY + v.necklineDrop,
				x: v.chestX - v.neckHalf,
				y: v.necklineY
			},
			{ type: 'close' }
		];
	}

	static leftShoulder(v) {
		return [
			{
				type: 'bezier',
				c1x: v.chestX - v.neckHalf - 8,
				c1y: v.necklineY,
				c2x: v.leftShoulder + v.shoulderRound,
				c2y: v.leftShoulderY - 3,
				x: v.leftShoulder,
				y: v.leftShoulderY + v.shoulderRound * 0.35
			},
			{
				type: 'quad',
				cx: v.leftShoulder - v.shoulderRound * 0.35,
				cy: v.leftShoulderY + v.shoulderRound,
				x: v.leftChest,
				y: v.armholeY
			}
		];
	}

	static rightShoulder(v) {
		return [
			{
				type: 'quad',
				cx: v.rightShoulder + v.shoulderRound * 0.35,
				cy: v.rightShoulderY + v.shoulderRound,
				x: v.rightShoulder,
				y: v.rightShoulderY + v.shoulderRound * 0.35
			},
			{
				type: 'bezier',
				c1x: v.rightShoulder - v.shoulderRound,
				c1y: v.rightShoulderY - 3,
				c2x: v.chestX + v.neckHalf + 8,
				c2y: v.necklineY,
				x: v.chestX + v.neckHalf,
				y: v.necklineY
			}
		];
	}
}
