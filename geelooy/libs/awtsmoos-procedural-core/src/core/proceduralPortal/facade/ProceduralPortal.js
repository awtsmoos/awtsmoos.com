//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ProceduralPortal.js
 * @description Exposes one calm semantic doorway while configuration, inspection, evolution, planning, compilation, and world-session mechanics stay in dedicated vessels.
 * The Awtsmoos is One before every API verb while each finite authority keeps its craft; Awtsmoos.com lets authors generate anything
 * through a small surface whose registry, planner, compiler, inspector data, budgets, adapters, provenance, and semantic evolution remain explicit and bright.
 */

import { isPortalPlan } from '../planning/PortalPlan.js';
import {
	createDerivedPortalConfiguration,
	createPortalFacadeConfiguration
} from './PortalFacadeConfiguration.js';
import { describeProceduralPortal } from './PortalFacadeDiscovery.js';
import { PortalEvolutionFacade } from './PortalEvolutionFacade.js';
import { PortalWorldSession } from './PortalWorldSession.js';

/** High-level semantic Portal API joining discovery, planning, realization, evolution, inspection, and world authoring without owning domain algorithms. */
export class ProceduralPortal extends PortalEvolutionFacade {
	/**
	 * @description Creates one frozen facade from an explicit registry, service collection, seed, and finite budget configuration.
	 * @param {object} input Portal dependencies and defaults.
	 * @param {object} input.registry Semantic kind registry.
	 * @param {object} [input.services={}] Explicit specialist and optional adapter services.
	 * @param {object|string} [input.budget='gameplay'] Default finite planning budget.
	 * @param {string} [input.seed='awtsmoos'] Default semantic seed root.
	 * @returns {ProceduralPortal} Frozen high-level Portal facade.
	 */
	constructor(input = {}) {
		super();
		Object.assign(this, createPortalFacadeConfiguration(input));
		Object.freeze(this);
	}

	/**
	 * @description Generates one semantic thing by planning and compiling its intent through the same specialist pipeline used by complete world sessions.
	 * @param {object|string} input Semantic recipe intent.
	 * @param {object} [options={}] Planning and compilation overrides.
	 * @returns {Promise<object>} PortalCompileResult containing runtime output and Universal world evidence.
	 */
	generate(input, options = {}) {
		return this.compile(input, options);
	}

	/**
	 * @description Preserves the original create verb as a compatibility alias for universal generation through the canonical compile pipeline.
	 * @param {object|string} input Semantic recipe intent.
	 * @param {object} [options={}] Planning and compilation overrides.
	 * @returns {Promise<object>} PortalCompileResult containing runtime output and Universal world evidence.
	 */
	create(input, options = {}) {
		return this.generate(input, options);
	}

	/**
	 * @description Starts an additive world-authoring session bound to this exact immutable Portal configuration.
	 * @param {object|string|Array<object|string>|null} [initial=null] Optional initial semantic root or root collection.
	 * @returns {PortalWorldSession} Mutable authoring session whose stored recipe snapshots remain immutable.
	 */
	world(initial = null) {
		return new PortalWorldSession(this, initial);
	}

	/**
	 * @description Dry-runs semantic intent into an immutable dependency, demand, budget, and provenance plan without specialist execution.
	 * @param {object|string|Array<object|string>} input One semantic intent or root collection.
	 * @param {object} [options={}] Plan-time seed and budget overrides.
	 * @returns {object} Immutable PortalPlan.
	 */
	plan(input, options = {}) {
		return this.planner.plan(input, options);
	}

	/**
	 * @description Compiles either a trusted PortalPlan or fresh semantic intent through the installed specialist registry in proven dependency order.
	 * @param {object|string|Array<object|string>} input PortalPlan or semantic intent.
	 * @param {object} [options={}] Planning and compilation overrides, including invocation-local services.
	 * @returns {Promise<object>} PortalCompileResult with runtime outputs, explanations, and Universal world data.
	 */
	compile(input, options = {}) {
		const plan = isPortalPlan(input)
			? input
			: this.plan(input, options);
		return this.compiler.compile(plan, options);
	}

	/**
	 * @description Returns global Portal metadata or one kind's JSON-safe definition plus generated inspector schema.
	 * @param {string|null} [kind=null] Optional canonical semantic kind or friendly alias.
	 * @returns {Readonly<object>} Frozen discovery metadata safe for docs, inspectors, and capability negotiation.
	 */
	describe(kind = null) {
		return describeProceduralPortal(this, kind);
	}

	/**
	 * @description Derives an independent Portal while optionally extending kinds, services, seed, or budget without mutating this instance.
	 * @param {object} [overrides={}] Registry, kinds, services, seed, or budget overrides.
	 * @returns {ProceduralPortal} Independent frozen Portal facade inheriting the same universal operation vocabulary.
	 */
	with(overrides = {}) {
		return new ProceduralPortal(
			createDerivedPortalConfiguration(this, overrides)
		);
	}
}
