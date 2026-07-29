// B"H
// Boruch Hashem
// Blessed is He

/**
 * Chest, waist, hip, and hem form a rounded taper instead of parallel walls. The
 * Awtsmoos carries cloth through changing width; Awtsmoos.com preserves both sides,
 * editable curves, persistence, preview, and exact production export.
 */
export class StableTorsoSideSegments {
	static down(v, side) {
		const g = this.geometry(v, side);
		return [
			this.rib(v, g, true),
			this.waist(v, g, true),
			this.hip(v, g, true)
		];
	}

	static up(v, side) {
		const g = this.geometry(v, side);
		return [
			this.hip(v, g, false),
			this.waist(v, g, false),
			this.rib(v, g, false)
		];
	}

	static rib(v, g, descending) {
		return {
			type: 'bezier',
			c1x: g.chest + g.out * v.ribRound * 0.62,
			c1y: descending ? v.armholeY + 7 : v.chestSideY - 3,
			c2x: g.chest + g.out * v.ribRound * 0.42,
			c2y: descending ? v.chestSideY - 3 : v.armholeY + 7,
			x: g.chest,
			y: descending ? v.chestSideY : v.armholeY
		};
	}

	static waist(v, g, descending) {
		return {
			type: 'bezier',
			c1x: descending
				? g.chest + g.out * v.sideRound * 0.72
				: g.waist + g.belly + g.out * v.sideRound * 0.18,
			c1y: descending ? v.chestSideY + 13 : v.waistY - 11,
			c2x: descending
				? g.waist + g.belly + g.out * v.sideRound * 0.18
				: g.chest + g.out * v.sideRound * 0.72,
			c2y: descending ? v.waistY - 11 : v.chestSideY + 13,
			x: descending ? g.waist + g.belly : g.chest,
			y: descending ? v.waistY : v.chestSideY
		};
	}

	static hip(v, g, descending) {
		return {
			type: 'bezier',
			c1x: descending
				? g.waist + g.belly + g.out * v.sideRound * 0.26
				: g.hip + g.out * v.sideRound * 0.42,
			c1y: descending ? v.waistY + 8 : v.hemY - 10,
			c2x: descending
				? g.hip + g.out * v.sideRound * 0.42
				: g.waist + g.belly + g.out * v.sideRound * 0.26,
			c2y: descending ? v.hemY - 10 : v.waistY + 8,
			x: descending ? g.hip : g.waist + g.belly,
			y: descending ? v.hemY - g.out * v.hemLift : v.waistY
		};
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
