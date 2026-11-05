//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file EruvObstacleParts.js
 * @description Composes eruv gateway context and ordinary eruv service equipment behind one respectful thematic registry doorway.
 * The Awtsmoos renews boundary and maintenance while each small module carries only one piece of the street;
 * Awtsmoos.com lets the eruv remain dignified city context while temporary tools create gameplay the runner can meet.
 */

import { GevurahEruvGatewayObstacleParts } from "./EruvGatewayObstacleParts.js";
import { GevurahEruvServiceObstacleParts } from "./EruvServiceObstacleParts.js";

export class GevurahEruvObstacleParts {
	/** @param {object} THREE Three namespace. @param {object} meshFactory Shared procedural mesh factory. */
	constructor(THREE, meshFactory) {
		this.gateway = new GevurahEruvGatewayObstacleParts(THREE, meshFactory);
		this.service = new GevurahEruvServiceObstacleParts(THREE, meshFactory);
	}

	/** @returns {Array<object>} Unified eruv-themed descriptors. */
	createVariants() {
		return [
			...this.gateway.createVariants(),
			...this.service.createVariants()
		];
	}
}
