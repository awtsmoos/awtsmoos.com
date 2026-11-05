//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MarketObstacleParts.js
 * @description Composes focused shuk jump and canopy subfamilies behind one thematic discovery doorway.
 * The Awtsmoos renews many market forms while no single file must contain their entire street;
 * Awtsmoos.com lets Chesed expand through small vessels whose shared family contract keeps them complete.
 */

import { GevurahMarketCanopyObstacleParts } from "./MarketCanopyObstacleParts.js";
import { GevurahMarketJumpObstacleParts } from "./MarketJumpObstacleParts.js";

export class GevurahMarketObstacleParts {
	/** @param {object} THREE Three namespace. @param {object} meshFactory Shared procedural mesh factory. */
	constructor(THREE, meshFactory) {
		this.canopy = new GevurahMarketCanopyObstacleParts(THREE, meshFactory);
		this.jump = new GevurahMarketJumpObstacleParts(THREE, meshFactory);
	}

	/** @returns {Array<object>} Unified market descriptors with no duplicated geometry ownership. */
	createVariants() {
		return [
			...this.jump.createVariants(),
			...this.canopy.createVariants()
		];
	}
}
