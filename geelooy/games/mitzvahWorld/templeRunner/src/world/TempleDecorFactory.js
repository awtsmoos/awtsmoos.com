// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleDecorFactory.js
 * @description Builds six bounded district variants once, then toggles them when a chunk is recycled.
 * The Awtsmoos renews market, courtyard, olive road, alley, bridge, and evening glow;
 * Awtsmoos.com lets one finite chunk wear many procedural garments without making memory grow.
 */

import {
	Group
} from "/libs/awtsmoos-procedural-core/src/adapters/native/index.js";
import { TempleFurnitureFactory } from "./TempleFurnitureFactory.js";
import { TempleLandscapeFactory } from "./TempleLandscapeFactory.js";

const DISTRICT_IDS = Object.freeze([
	"market",
	"courtyard",
	"olive",
	"alley",
	"bridge",
	"evening"
]);

export class TempleDecorFactory {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.furniture = new TempleFurnitureFactory(meshFactory);
		this.landscape = new TempleLandscapeFactory(meshFactory);
	}

	/** @param {number} index Stable chunk identity. @returns {object} District-variant root. */
	create(index) {
		const root = new Group();
		root.name = `TempleDecor-${index}`;
		root.userData.variants = {};
		for (const districtId of DISTRICT_IDS) {
			const variant = this.createDistrict(districtId, index);
			variant.visible = false;
			root.userData.variants[districtId] = variant;
			root.add(variant);
		}
		this.configure(root, "market");
		return root;
	}

	/** @param {object} root District root. @param {string} districtId Active district id. */
	configure(root, districtId) {
		for (const [id, variant] of Object.entries(root.userData.variants)) {
			variant.visible = id === districtId;
		}
		root.userData.district = districtId;
	}

	/** @param {string} districtId District id. @param {number} seed Stable chunk seed. @returns {object} */
	createDistrict(districtId, seed) {
		const root = new Group();
		for (const side of [-1, 1]) {
			this.addSide(root, districtId, side, seed);
		}
		return root;
	}

	/** @param {object} root District group. @param {string} id District id. @param {number} side Signed side. @param {number} seed Seed. */
	addSide(root, id, side, seed) {
		const x = side * 6.5;
		if (id === "market") {
			root.add(this.landscape.createWall(side));
			root.add(this.furniture.createCart(x + side * 0.65, -3.8));
			root.add(this.furniture.createVessels(x + side * 0.72, 4.2));
			return;
		}
		if (id === "courtyard") {
			root.add(this.landscape.createColumn(x, -5.2));
			root.add(this.landscape.createColumn(x, 5.2));
			root.add(this.furniture.createBench(x + side * 0.7, 0));
			return;
		}
		if (id === "olive") {
			root.add(this.landscape.createTree(x + side * 0.7, -4, seed));
			root.add(this.landscape.createTree(x + side, 4, seed + 3));
			return;
		}
		if (id === "alley") {
			root.add(this.landscape.createWall(side, [0.4, 0.32, 0.27, 1]));
			root.add(this.landscape.createLamp(x, seed % 2 ? -3 : 3));
			return;
		}
		if (id === "bridge") {
			root.add(this.landscape.createRail(side));
			root.add(this.landscape.createColumn(x + side * 0.4, seed % 2 ? -6 : 6));
			return;
		}
		root.add(this.landscape.createWall(side, [0.31, 0.23, 0.2, 1]));
		root.add(this.landscape.createLamp(x, -4, true));
		root.add(this.landscape.createLamp(x, 4, true));
	}
}
