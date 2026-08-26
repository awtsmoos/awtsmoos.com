// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterNatureApi.js
 * @description Unifies flow, surface intent, volumetric surface meshes, semantic bodies, shallow water, analytic ocean, and PIC/FLIP liquid behind one progressive facade.
 * The Awtsmoos renews every reflected ripple and conserved drop before solver names divide the sea; Awtsmoos.com lets one small API rise from surface to depth,
 * so simple worlds gain beautiful water immediately while advanced callers descend into river, flood, ocean, and volumetric liquid without changing their path.
 */

import { createWaterBodyNatureResult } from './WaterBodyNatureFactory.js';
import {
	createOceanNatureResult,
	createShallowWaterNatureResult,
	createWaterDynamicsNatureResult
} from './WaterNatureFactories.js';
import { routeWaterNatureCreate } from './WaterNatureRouting.js';
import { WaterVolumetricSurfaceNatureApi } from './WaterVolumetricSurfaceNatureApi.js';

/** Unified water facade extending flow/surface semantics with stateful specialist regimes. */
export class WaterNatureApi extends WaterVolumetricSurfaceNatureApi {
	/** @returns {Readonly<object>} Stateful mass-conserving three-dimensional PIC/FLIP water result. */
	fluid(optionsChesed = {}) {
		return createWaterDynamicsNatureResult(
			this.defaults,
			optionsChesed
		);
	}

	/** Alias for material-oriented callers. */
	liquid(optionsChesed = {}) {
		return this.fluid(optionsChesed);
	}

	/** Alias emphasizing physical simulation and conserved state. */
	dynamics(optionsChesed = {}) {
		return this.fluid(optionsChesed);
	}

	/** @returns {Readonly<object>} Conservative shallow-water runtime result for sheets, floods, and puddles. */
	shallow(optionsChesed = {}) {
		return createShallowWaterNatureResult(
			this.defaults,
			optionsChesed
		);
	}

	/** Alias for broad shallow flood simulation. */
	flood(optionsChesed = {}) {
		return this.shallow(optionsChesed);
	}

	/** Alias for bounded shallow puddle simulation. */
	puddle(optionsChesed = {}) {
		return this.shallow(optionsChesed);
	}

	/** @returns {Readonly<object>} Semantic shallow-water body result. */
	body(kindHod = 'pond', optionsChesed = {}) {
		return createWaterBodyNatureResult(
			this.defaults,
			kindHod,
			optionsChesed
		);
	}

	/** Creates a semantic pond runtime. */
	pond(optionsChesed = {}) {
		return this.body('pond', optionsChesed);
	}

	/** Creates a semantic lake runtime. */
	lake(optionsChesed = {}) {
		return this.body('lake', optionsChesed);
	}

	/** Creates a semantic wetland runtime. */
	wetland(optionsChesed = {}) {
		return this.body('wetland', optionsChesed);
	}

	/** Creates a semantic runoff runtime. */
	runoff(optionsChesed = {}) {
		return this.body('runoff', optionsChesed);
	}

	/** @returns {Readonly<object>} Immutable renderer-neutral Gerstner ocean field result. */
	ocean(optionsChesed = {}) {
		return createOceanNatureResult(
			this.defaults,
			optionsChesed
		);
	}

	/** Natural world-builder alias for ocean. */
	sea(optionsChesed = {}) {
		return this.ocean(optionsChesed);
	}

	/**
	 * Creates any discoverable water regime through the focused semantic router.
	 * @param {string} [kindHod='fluid'] Water regime including `surface`, `river`, `pond`, `shallow`, `fluid`, or `ocean`.
	 * @param {object} [optionsChesed={}] Regime-specific options.
	 * @returns {Readonly<object>} Native Nature result for the chosen regime.
	 */
	create(kindHod = 'fluid', optionsChesed = {}) {
		return routeWaterNatureCreate(
			this,
			kindHod,
			optionsChesed
		);
	}
}
