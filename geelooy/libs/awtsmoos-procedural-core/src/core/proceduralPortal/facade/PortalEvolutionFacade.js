//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalEvolutionFacade.js
 * @description Adds immutable semantic revision plus adapter-aware export and simulation verbs above the read-only Portal inspection layer.
 * The Awtsmoos renews every world without losing the truth from which it came; Awtsmoos.com lets this Netzach-like facade
 * derive, export, and simulate through explicit authorities while mutation remains revision and absent providers are never falsely portrayed.
 */

import { exportPortalValue } from '../operations/PortalExport.js';
import { revisePortalIntent } from '../operations/PortalRevision.js';
import { simulatePortalIntent } from '../operations/PortalSimulation.js';
import { PortalInspectionFacade } from './PortalInspectionFacade.js';

/** Evolution and adapter operation layer inherited by the concrete ProceduralPortal facade. */
export class PortalEvolutionFacade extends PortalInspectionFacade {
	/**
	 * @description Derives one immutable semantic definition with parent provenance and incremented revision unless explicitly overridden.
	 * @param {object|string} input Semantic root intent.
	 * @param {object} [overrides={}] Section-aware Procedural Language overrides.
	 * @param {object} [options={}] Canonicalization seed/index context.
	 * @returns {Readonly<object>} Derived canonical Procedural Language definition.
	 */
	revise(input, overrides = {}, options = {}) {
		return revisePortalIntent(this, input, overrides, options);
	}

	/**
	 * @description Compatibility-friendly semantic mutation verb implemented strictly as immutable revision rather than in-place data change.
	 * @param {object|string} input Semantic root intent.
	 * @param {object} [overrides={}] Section-aware semantic overrides.
	 * @param {object} [options={}] Canonicalization seed/index context.
	 * @returns {Readonly<object>} Derived immutable definition.
	 */
	mutate(input, overrides = {}, options = {}) {
		return this.revise(input, overrides, options);
	}

	/**
	 * @description Exports canonical JSON natively or delegates a specialist target through an explicit exporter adapter.
	 * @param {*} input Semantic intent or already-produced Portal/world value.
	 * @param {string} [target='canonical-json'] Export target identifier.
	 * @param {object} [options={}] Planner/exporter operation options.
	 * @returns {Promise<Readonly<object>>} Export receipt describing ready, deferred, or executed status.
	 */
	export(input, target = 'canonical-json', options = {}) {
		return exportPortalValue(this, input, target, options);
	}

	/**
	 * @description Simulates through an installed simulator adapter or returns explicit deferred evidence when none is configured.
	 * @param {*} input Semantic intent to simulate.
	 * @param {object} [options={}] Planner/simulator operation options.
	 * @returns {Promise<Readonly<object>>} Simulation receipt describing deferred or executed status.
	 */
	simulate(input, options = {}) {
		return simulatePortalIntent(this, input, options);
	}
}
