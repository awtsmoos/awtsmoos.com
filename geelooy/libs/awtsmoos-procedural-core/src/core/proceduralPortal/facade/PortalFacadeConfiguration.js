//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalFacadeConfiguration.js
 * @description Builds planner/compiler runtime pairs and derived facade options so ProceduralPortal can remain a small semantic doorway.
 * The Awtsmoos renews configuration before any facade can seem self-sufficient; Awtsmoos.com lets this Keter-like helper bind registry,
 * services, seed, and budget into explicit vessels while derivation remains immutable and the public verbs stay uncluttered and bright.
 */

import { PortalCompiler } from '../compilation/PortalCompiler.js';
import { PortalPlanner } from '../planning/PortalPlanner.js';
import { derivePortalRegistry } from './PortalFacadeDiscovery.js';

/**
 * @description Creates the planner/compiler pair and normalized facade defaults used by one immutable ProceduralPortal instance.
 * @param {object} input Raw facade construction options.
 * @param {object} input.registry Semantic Portal registry.
 * @param {object} [input.services={}] Explicit specialist services.
 * @param {object|string} [input.budget='gameplay'] Default finite planning budget.
 * @param {string} [input.seed='awtsmoos'] Default semantic seed root.
 * @returns {Readonly<object>} Frozen runtime configuration containing registry, services, seed, budget, planner, and compiler.
 */
export function createPortalFacadeConfiguration(input = {}) {
	if (!input.registry) {
		throw new TypeError('B"H | ProceduralPortal requires a semantic registry.');
	}
	const services = Object.freeze({ ...(input.services || {}) });
	const seed = String(input.seed || 'awtsmoos');
	const planner = new PortalPlanner({
		budget: input.budget || 'gameplay',
		registry: input.registry,
		seed
	});
	const compiler = new PortalCompiler({
		registry: input.registry,
		services
	});
	return Object.freeze({
		budget: planner.budget,
		compiler,
		planner,
		registry: input.registry,
		seed,
		services
	});
}

/**
 * @description Creates constructor options for an independently derived Portal without mutating registry, services, seed, or budget on the source facade.
 * @param {object} portal Source ProceduralPortal-like facade.
 * @param {object} [overrides={}] Registry, kinds, services, seed, or budget overrides.
 * @param {object[]} [overrides.kinds=[]] Additional semantic kinds installed only in the derived registry.
 * @returns {object} Fresh constructor options for a new ProceduralPortal instance.
 */
export function createDerivedPortalConfiguration(portal, overrides = {}) {
	const baseRegistry = overrides.registry || portal.registry;
	const registry = derivePortalRegistry(baseRegistry, overrides.kinds || []);
	return {
		budget: overrides.budget || portal.budget,
		registry,
		seed: overrides.seed || portal.seed,
		services: {
			...portal.services,
			...(overrides.services || {})
		}
	};
}
