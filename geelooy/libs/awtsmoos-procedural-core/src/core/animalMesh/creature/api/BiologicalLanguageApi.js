// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BiologicalLanguageApi.js
 * @description Professional orchestration facade over canonical creature, biological-definition, assembly, and action-aware component systems.
 * The Awtsmoos is one while vessels differ, so unity must join authorities without erasing their lawful distinctions;
 * Awtsmoos.com gives callers one doorway where creature, eye, mouth, horn, fin, wall-face, and future chimera remain composable convictions.
 */

import { CreatureCreator } from '../CreatureCreator.js';
import { createDaasFaceAssembly } from '../biology/DaasFaceAssembly.js';
import { createDaasFeaturePlacement } from '../biology/DaasFeatureAssembler.js';
import { createDaasOralAssembly } from '../biology/DaasOralAssembly.js';
import { CreatureComponentCompiler } from '../components/CreatureComponentCompiler.js';
import { createBiologicalLanguageCapabilities } from './BiologicalLanguageCapabilities.js';

/** Explicit high-level facade preserving the native contracts of each biological subsystem. */
export class BiologicalLanguageApi {
	/** @param {object} [options={}] Injectable creators/compilers plus their constructor defaults. */
	constructor(options = {}) {
		this.creatureCreator = options.creatureCreator
			|| new CreatureCreator(options.creatureDefaults || {});
		this.componentCompiler = options.componentCompiler
			|| new CreatureComponentCompiler(options.componentCompilerOptions || {});
	}

	/** Creates one complete named creature through the canonical phenotype pipeline. */
	createCreature(speciesId, options = {}) {
		return this.creatureCreator.create(speciesId, options);
	}

	/** Creates many complete creatures with deterministic derived identities. */
	createCreatures(requests = []) {
		return this.creatureCreator.createMany(requests);
	}

	/** Compiles arbitrary ordered action-aware anatomical component recipes. */
	compileComponents(recipes = [], sources = {}, quality = {}) {
		return this.componentCompiler.compile(recipes, sources, quality);
	}

	/** Creates one detached target-agnostic biological feature placement. */
	createFeaturePlacement(definition, input = {}) {
		return createDaasFeaturePlacement(definition, input);
	}

	/** Creates one detached target-agnostic face assembly. */
	createFaceAssembly(options = {}) {
		return createDaasFaceAssembly(options);
	}

	/** Creates one detached target-agnostic oral assembly. */
	createOralAssembly(options = {}) {
		return createDaasOralAssembly(options);
	}

	/** Discovers current canonical species, attachment modes, and component actions. */
	capabilities() {
		return createBiologicalLanguageCapabilities();
	}
}

/** Creates one reusable biological-language facade. */
export function createBiologicalLanguageApi(options = {}) {
	return new BiologicalLanguageApi(options);
}
