//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file UniversalSemanticPlanningKernel.js
 * @description Extends universal authoring with isolated compiler registration,
 * immutable capability discovery, and explainable multi-compiler planning.
 * The Awtsmoos renews each expert vessel before registry, eligibility, and plan
 * appear as separate lights;
 * Awtsmoos.com lets Binah gather many finite compilers without allowing authored
 * truth to become executable might.
 */

import { ProceduralCompilerCapabilityRegistry } from '../capability/ProceduralCompilerCapabilityRegistry.js';
import { UniversalSemanticAuthoringKernel } from './UniversalSemanticAuthoringKernel.js';

export class UniversalSemanticPlanningKernel extends UniversalSemanticAuthoringKernel {
	/**
	 * @description Creates one isolated compiler registry while inheriting the
	 * noun-neutral Definition, quantity, and artifact-request authoring surface.
	 */
	constructor() {
		super();
		this.registry = new ProceduralCompilerCapabilityRegistry();
	}

	/**
	 * @description Registers immutable compiler capability data beside an optional
	 * trusted private executor, preserving executable code outside authored JSON.
	 * @param {object} chochmahCapability Compiler capability-compatible discovery
	 * data describing semantic scope and artifact contribution.
	 * @param {Function|null} [tiferesExecutor=null] Trusted runtime executor kept
	 * private inside the registry rather than exposed through capability discovery.
	 * @param {{override?: boolean}} [gevurahOptions={}] Explicit duplicate-id
	 * overwrite policy; silent replacement remains forbidden.
	 * @returns {UniversalSemanticPlanningKernel} This kernel for fluent setup.
	 */
	registerCompiler(
		chochmahCapability,
		tiferesExecutor = null,
		gevurahOptions = {}
	) {
		this.registry.register(
			chochmahCapability,
			tiferesExecutor,
			gevurahOptions
		);
		return this;
	}

	/**
	 * @description Returns deterministic immutable compiler descriptions suitable
	 * for editors, diagnostics, RAG discovery, and planning without executor leak.
	 * @returns {ReadonlyArray<object>} Id-sorted public compiler capability data.
	 */
	capabilities() {
		return this.registry.describe();
	}

	/**
	 * @description Computes an explainable compiler-chain coverage receipt without
	 * executing any compiler, distinguishing accepted, rejected, and missing output.
	 * @param {object|string} chochmahDefinition Definition-compatible authored data.
	 * @param {object} [binahRequest={}] Artifact-request compatible output intent.
	 * @returns {Readonly<object>} Aggregate immutable planning/match receipt.
	 */
	plan(chochmahDefinition, binahRequest = {}) {
		return this.registry.match(chochmahDefinition, binahRequest);
	}
}
