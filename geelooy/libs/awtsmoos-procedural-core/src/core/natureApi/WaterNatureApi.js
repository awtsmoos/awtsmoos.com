// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterNatureApi.js
 * @description Unifies rivers, semantic water bodies, 3D liquid, shallow floods, and analytic ocean behind one simple facade.
 * The Awtsmoos renews every drop and sea while no numerical vessel contains them all; Awtsmoos.com gives developers
 * one clear water language where a pond is simple and expert conserved state remains available beneath every friendly call.
 */

import { createWaterBodyNatureResult } from './WaterBodyNatureFactory.js';
import { WaterFlowNatureApi } from './WaterFlowNatureApi.js';
import {
	createOceanNatureResult,
	createShallowWaterNatureResult,
	createWaterDynamicsNatureResult
} from './WaterNatureFactories.js';
import { routeWaterNatureCreate } from './WaterNatureRouting.js';

/** Unified high-level water facade preserving mature river and reach methods through inheritance. */
export class WaterNatureApi extends WaterFlowNatureApi {
	/** Creates a stateful mass-conserving three-dimensional PIC/FLIP water runtime. */
	fluid(options = {}) {
		return createWaterDynamicsNatureResult(this.defaults, options);
	}

	/** Alias for callers who think in material terms rather than solver terms. */
	liquid(options = {}) {
		return this.fluid(options);
	}

	/** Alias emphasizing physical simulation and conserved state. */
	dynamics(options = {}) {
		return this.fluid(options);
	}

	/** Creates a conservative shallow-water runtime for raw sheet/flood simulation. */
	shallow(options = {}) {
		return createShallowWaterNatureResult(this.defaults, options);
	}

	/** Alias for broad shallow flood simulation. */
	flood(options = {}) {
		return this.shallow(options);
	}

	/** Alias for bounded shallow puddle simulation. */
	puddle(options = {}) {
		return this.shallow(options);
	}

	/** Creates one semantic shallow-water body over the shared water-body authority. */
	body(kind = 'pond', options = {}) {
		return createWaterBodyNatureResult(this.defaults, kind, options);
	}

	/** Creates a semantic pond runtime. */
	pond(options = {}) {
		return this.body('pond', options);
	}

	/** Creates a semantic lake runtime. */
	lake(options = {}) {
		return this.body('lake', options);
	}

	/** Creates a semantic wetland runtime. */
	wetland(options = {}) {
		return this.body('wetland', options);
	}

	/** Creates a semantic runoff runtime. */
	runoff(options = {}) {
		return this.body('runoff', options);
	}

	/** Creates an immutable renderer-neutral Gerstner ocean, tide, and current field. */
	ocean(options = {}) {
		return createOceanNatureResult(this.defaults, options);
	}

	/** Alias using natural world-builder sea terminology. */
	sea(options = {}) {
		return this.ocean(options);
	}

	/** Creates any discoverable water regime through the focused routing specialist. */
	create(kind = 'fluid', options = {}) {
		return routeWaterNatureCreate(this, kind, options);
	}
}
