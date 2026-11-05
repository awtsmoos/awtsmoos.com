// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleObstacleFactory.js
 * @description Dispatches exactly three gameplay laws into richer reusable procedural obstacle families.
 * The Awtsmoos renews many forms while one law remains simple in every lane;
 * Awtsmoos.com lets avoid, jump, and duck stay pure even as the visible street changes again.
 */

import { GevurahAvoidObstacleFactory } from "./obstacles/AvoidObstacleFactory.js";
import { GevurahJumpObstacleFactory } from "./obstacles/JumpObstacleFactory.js";
import { GevurahDuckObstacleFactory } from "./obstacles/DuckObstacleFactory.js";

export class TempleObstacleFactory {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.factories = {
			avoid: new GevurahAvoidObstacleFactory(meshFactory),
			jump: new GevurahJumpObstacleFactory(meshFactory),
			duck: new GevurahDuckObstacleFactory(meshFactory)
		};
	}

	/**
	 * Creates one reusable obstacle slot for the requested gameplay law.
	 * @param {string} law avoid, jump, or duck.
	 * @returns {object} Reusable native obstacle group.
	 */
	createSlot(law = "avoid") {
		return this.resolveFactory(law).createSlot();
	}

	/**
	 * Configures a reusable slot without changing its gameplay law.
	 * @param {object} slot Existing obstacle slot.
	 * @param {number} variantIndex Visual variant seed.
	 */
	configure(slot, variantIndex = 0) {
		const law = slot.userData.law || "avoid";
		this.resolveFactory(law).configure(slot, variantIndex);
	}

	/** @param {string} law Candidate law. @returns {object} Matching obstacle family factory. */
	resolveFactory(law) {
		return this.factories[law] || this.factories.avoid;
	}
}
