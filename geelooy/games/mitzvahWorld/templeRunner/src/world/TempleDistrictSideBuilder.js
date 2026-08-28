//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleDistrictSideBuilder.js
 * @description Owns the visual recipe for one side of each Jerusalem district.
 * The Awtsmoos gives market, courtyard, olive, alley, bridge, and evening their form;
 * Awtsmoos.com keeps each recipe focused so lazy revelation stays readable through the storm.
 */

export class TempleDistrictSideBuilder {
	/**
	 * Stores the already-shared furniture and landscape factories.
	 * @param {object} dependencies Builder dependencies.
	 * @param {object} dependencies.furniture Shared furniture factory.
	 * @param {object} dependencies.landscape Shared landscape factory.
	 */
	constructor({ furniture, landscape }) {
		this.furniture = furniture;
		this.landscape = landscape;
	}

	/**
	 * Adds one district's historically defined scenery to one signed road side.
	 * @param {object} root District group receiving scenery.
	 * @param {string} districtId District id.
	 * @param {number} side Signed road side.
	 * @param {number} seed Stable chunk seed.
	 * @returns {void}
	 */
	add(root, districtId, side, seed) {
		const x = side * 6.5;
		if (districtId === "market") {
			this.addMarket(root, side, x);
			return;
		}
		if (districtId === "courtyard") {
			this.addCourtyard(root, side, x);
			return;
		}
		if (districtId === "olive") {
			this.addOlive(root, side, x, seed);
			return;
		}
		if (districtId === "alley") {
			this.addAlley(root, side, x, seed);
			return;
		}
		if (districtId === "bridge") {
			this.addBridge(root, side, x, seed);
			return;
		}
		this.addEvening(root, side, x);
	}

	/** @param {object} root District root. @param {number} side Signed side. @param {number} x Street X. */
	addMarket(root, side, x) {
		root.add(this.landscape.createWall(side));
		root.add(this.furniture.createCart(x + side * 0.65, -3.8));
		root.add(this.furniture.createVessels(x + side * 0.72, 4.2));
	}

	/** @param {object} root District root. @param {number} side Signed side. @param {number} x Street X. */
	addCourtyard(root, side, x) {
		root.add(this.landscape.createColumn(x, -5.2));
		root.add(this.landscape.createColumn(x, 5.2));
		root.add(this.furniture.createBench(x + side * 0.7, 0));
	}

	/** @param {object} root District root. @param {number} side Signed side. @param {number} x Street X. @param {number} seed Chunk seed. */
	addOlive(root, side, x, seed) {
		root.add(this.landscape.createTree(x + side * 0.7, -4, seed));
		root.add(this.landscape.createTree(x + side, 4, seed + 3));
	}

	/** @param {object} root District root. @param {number} side Signed side. @param {number} x Street X. @param {number} seed Chunk seed. */
	addAlley(root, side, x, seed) {
		root.add(this.landscape.createWall(side, [0.4, 0.32, 0.27, 1]));
		root.add(this.landscape.createLamp(x, seed % 2 ? -3 : 3));
	}

	/** @param {object} root District root. @param {number} side Signed side. @param {number} x Street X. @param {number} seed Chunk seed. */
	addBridge(root, side, x, seed) {
		root.add(this.landscape.createRail(side));
		root.add(this.landscape.createColumn(x + side * 0.4, seed % 2 ? -6 : 6));
	}

	/** @param {object} root District root. @param {number} side Signed side. @param {number} x Street X. */
	addEvening(root, side, x) {
		root.add(this.landscape.createWall(side, [0.31, 0.23, 0.2, 1]));
		root.add(this.landscape.createLamp(x, -4, true));
		root.add(this.landscape.createLamp(x, 4, true));
	}
}
