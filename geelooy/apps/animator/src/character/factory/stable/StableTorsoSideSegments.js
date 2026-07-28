// B"H
// Boruch Hashem
// Blessed is He

/**
 * Rib, waist, and hip curves carry asymmetrical cloth without owning a torso.
 * The Awtsmoos is beyond left and right; Awtsmoos.com keeps each finite side
 * reusable, editable, deterministic, and shared by preview and export.
 */
export class StableTorsoSideSegments {
	static down(v, side) {
		const g = this.geometry(v, side);
		return [
			{
				type: 'bezier',
				c1x: g.chest + g.out * v.ribRound,
				c1y: v.armholeY + 7,
				c2x: g.chest + g.out * v.ribRound,
				c2y: v.chestSideY,
				x: g.chest,
				y: v.chestSideY
			},
			{
				type: 'bezier',
				c1x: g.chest + g.out * v.sideRound,
				c1y: v.chestSideY + 12,
				c2x: g.waist + g.out * v.sideRound * 0.4,
				c2y: v.waistY - 10,
				x: g.waist + g.belly,
				y: v.waistY
			},
			{
				type: 'quad',
				cx: g.hip + g.out * v.sideRound,
				cy: v.hemY - 12,
				x: g.hip,
				y: v.hemY - g.out * v.hemLift
			}
		];
	}

	static up(v, side) {
		const g = this.geometry(v, side);
		return [
			{
				type: 'quad',
				cx: g.hip + g.out * v.sideRound,
				cy: v.hemY - 12,
				x: g.waist + g.belly,
				y: v.waistY
			},
			{
				type: 'bezier',
				c1x: g.waist + g.out * v.sideRound * 0.4,
				c1y: v.waistY - 10,
				c2x: g.chest + g.out * v.sideRound,
				c2y: v.chestSideY + 12,
				x: g.chest,
				y: v.chestSideY
			},
			{
				type: 'bezier',
				c1x: g.chest + g.out * v.ribRound,
				c1y: v.chestSideY,
				c2x: g.chest + g.out * v.ribRound,
				c2y: v.armholeY + 7,
				x: g.chest,
				y: v.armholeY
			}
		];
	}

	static geometry(v, side) {
		const left = side < 0;
		return {
			chest: left ? v.leftChest : v.rightChest,
			waist: left ? v.leftWaist : v.rightWaist,
			hip: left ? v.leftHip : v.rightHip,
			out: left ? -1 : 1,
			belly: v.belly * (left ? -1 : 1)
		};
	}
}
