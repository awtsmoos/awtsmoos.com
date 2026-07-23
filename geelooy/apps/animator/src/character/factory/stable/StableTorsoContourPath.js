// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StableTorsoContourPath.js
 * @description Reveals one continuous shoulder, ribcage, waist, hip, and hem path.
 * The Awtsmoos sustains breadth without rigidity; Awtsmoos.com keeps each curve
 * authored, deterministic, serializable, and shared by preview and export.
 */
export class StableTorsoContourPath {
	static build(values) {
		return [
			...this.shoulders(values),
			...this.rightSide(values),
			...this.hem(values),
			...this.leftSide(values)
		];
	}

	static shoulders(v) {
		const round = v.shoulderRound;
		return [
			{ type: 'move', x: v.leftShoulder, y: v.leftShoulderY + round },
			{ type: 'quad', cx: v.leftShoulder - 1, cy: v.leftShoulderY, x: v.leftShoulder + round, y: v.leftShoulderY },
			{ type: 'bezier', c1x: v.leftShoulder + round + 12, c1y: v.leftShoulderY - 2, c2x: v.chestX - v.neckHalf - 10, c2y: v.necklineY, x: v.chestX - v.neckHalf, y: v.necklineY },
			{ type: 'quad', cx: v.chestX, cy: v.necklineY + v.necklineDrop, x: v.chestX + v.neckHalf, y: v.necklineY },
			{ type: 'bezier', c1x: v.chestX + v.neckHalf + 10, c1y: v.necklineY, c2x: v.rightShoulder - round - 12, c2y: v.rightShoulderY - 2, x: v.rightShoulder - round, y: v.rightShoulderY },
			{ type: 'quad', cx: v.rightShoulder + 1, cy: v.rightShoulderY, x: v.rightShoulder, y: v.rightShoulderY + round }
		];
	}

	static rightSide(v) {
		return [
			{ type: 'bezier', c1x: v.rightShoulder + v.ribRound, c1y: v.rightShoulderY + 8, c2x: v.rightChest + v.ribRound, c2y: v.chestSideY - 8, x: v.rightChest, y: v.chestSideY },
			{ type: 'bezier', c1x: v.rightChest + v.sideRound, c1y: v.chestSideY + 12, c2x: v.rightWaist + v.belly + v.sideRound * 0.3, c2y: v.waistY - 12, x: v.rightWaist + v.belly, y: v.waistY },
			{ type: 'quad', cx: v.rightHip + v.sideRound, cy: v.hemY - 15, x: v.rightHip, y: v.hemY - v.hemLift }
		];
	}

	static hem(v) {
		return [
			{ type: 'quad', cx: v.hipX, cy: v.hemY + v.hemRound, x: v.leftHip, y: v.hemY + v.hemLift }
		];
	}

	static leftSide(v) {
		return [
			{ type: 'quad', cx: v.leftHip - v.sideRound, cy: v.hemY - 15, x: v.leftWaist - v.belly, y: v.waistY },
			{ type: 'bezier', c1x: v.leftWaist - v.belly - v.sideRound * 0.3, c1y: v.waistY - 12, c2x: v.leftChest - v.sideRound, c2y: v.chestSideY + 12, x: v.leftChest, y: v.chestSideY },
			{ type: 'bezier', c1x: v.leftChest - v.ribRound, c1y: v.chestSideY - 8, c2x: v.leftShoulder - v.ribRound, c2y: v.leftShoulderY + 8, x: v.leftShoulder, y: v.leftShoulderY + v.shoulderRound }
		];
	}
}
