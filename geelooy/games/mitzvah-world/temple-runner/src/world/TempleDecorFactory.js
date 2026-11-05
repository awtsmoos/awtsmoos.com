//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleDecorFactory.js
 * @description Owns lazy district lifecycle for each recyclable Jerusalem chunk.
 * The Awtsmoos holds every district ready before stone enters sight;
 * Awtsmoos.com reveals each street once, then keeps its vessel for every later flight.
 */

import {
	Group
} from "../../../../../libs/awtsmoos-procedural-core/src/adapters/native/index.js?compact=true";
import { TempleDistrictSideBuilder } from "./TempleDistrictSideBuilder.js";
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
	/**
	 * Creates the district lifecycle owner from one shared procedural mesh factory.
	 * @param {object} meshFactory Shared native procedural mesh materializer.
	 */
	constructor(meshFactory) {
		this.furniture = new TempleFurnitureFactory(meshFactory);
		this.landscape = new TempleLandscapeFactory(meshFactory);
		this.sideBuilder = new TempleDistrictSideBuilder({
			furniture: this.furniture,
			landscape: this.landscape
		});
	}

	/**
	 * Creates one stable decor root and materializes only its initial market district.
	 * @param {number} index Stable chunk identity and procedural seed.
	 * @returns {object} Memoizing district root.
	 */
	create(index) {
		const root = new Group();
		root.name = `TempleDecor-${index}`;
		root.userData.variants = {};
		root.userData.seed = index;
		this.configure(root, "market");
		return root;
	}

	/**
	 * Reveals one requested district while hiding every cached sibling.
	 * Unknown ids preserve the historic behavior of hiding all known variants.
	 * @param {object} root Stable chunk district root.
	 * @param {string} districtId Requested district id.
	 * @returns {void}
	 */
	configure(root, districtId) {
		if (DISTRICT_IDS.includes(districtId)) {
			this.revealDistrict(root, districtId);
		}
		for (const [id, variant] of Object.entries(root.userData.variants)) {
			variant.visible = id === districtId;
		}
		root.userData.district = districtId;
	}

	/**
	 * Materializes one district at most once for one recyclable chunk.
	 * @param {object} root Stable chunk district root.
	 * @param {string} districtId Known district id.
	 * @returns {object} Cached or newly created district group.
	 */
	revealDistrict(root, districtId) {
		if (root.userData.variants[districtId]) {
			return root.userData.variants[districtId];
		}
		const variant = this.createDistrict(districtId, root.userData.seed);
		variant.visible = false;
		root.userData.variants[districtId] = variant;
		root.add(variant);
		return variant;
	}

	/**
	 * Builds both streetsides for one district variant.
	 * @param {string} districtId Known district id.
	 * @param {number} seed Stable chunk seed.
	 * @returns {object} District variant root.
	 */
	createDistrict(districtId, seed) {
		const root = new Group();
		for (const side of [-1, 1]) {
			this.addSide(root, districtId, side, seed);
		}
		return root;
	}

	/**
	 * Preserves the historic side-building entry point while delegating recipe ownership.
	 * @param {object} root District group receiving scenery.
	 * @param {string} districtId District id.
	 * @param {number} side Signed street side.
	 * @param {number} seed Stable chunk seed.
	 * @returns {void}
	 */
	addSide(root, districtId, side, seed) {
		this.sideBuilder.add(root, districtId, side, seed);
	}
}
