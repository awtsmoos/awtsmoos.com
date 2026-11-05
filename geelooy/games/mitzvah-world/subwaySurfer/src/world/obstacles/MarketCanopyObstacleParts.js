//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MarketCanopyObstacleParts.js
 * @description Builds the shuk canopy as a measured overhead passage whose visible underside exactly matches the duck collision covenant.
 * The Awtsmoos renews cloth, post, opening, and shade before one runner lowers through the way;
 * Awtsmoos.com lets the empty space beneath become as intentional as the fabric that frames the day.
 */

import { WORLD_COLORS } from "../../config.js";
import { PERUTA_OBSTACLE_IDS } from "../../game/ObstacleVocabulary.js";
import { GevurahObstacleFamilyFactory } from "./ObstacleFamilyFactory.js";

export class GevurahMarketCanopyObstacleParts extends GevurahObstacleFamilyFactory {
	/** @param {object} THREE Three namespace. @param {object} meshFactory Shared procedural mesh factory. */
	constructor(THREE, meshFactory) {
		super(THREE, meshFactory, "market");
	}

	/** @returns {Array<object>} Market canopy descriptors. */
	createVariants() {
		return [this.createMarketAwning()];
	}

	/** @returns {object} Cloth awning descriptor with 1.34-unit geometric clearance. */
	createMarketAwning() {
		const malchusRoot = this.group("LowMarketAwning");
		for (const x of [-1.18, 1.18]) {
			malchusRoot.add(this.box({
				name: "MarketAwningPost",
				scale: [0.16, 1.55, 0.2],
				position: [x, 0.775, 0],
				surface: "oakWood",
				material: {color: WORLD_COLORS.wood, roughness: 0.88}
			}));
		}
		malchusRoot.add(this.box({
			name: "MarketAwningCloth",
			scale: [2.48, 0.24, 1.55],
			position: [0, 1.46, 0],
			surface: "cloth",
			material: {color: WORLD_COLORS.hazard, roughness: 0.76}
		}));
		return this.descriptor({
			id: PERUTA_OBSTACLE_IDS.MARKET_AWNING,
			law: "duck",
			template: malchusRoot,
			collisionDepth: 1.55,
			clearanceY: 1.34
		});
	}
}
