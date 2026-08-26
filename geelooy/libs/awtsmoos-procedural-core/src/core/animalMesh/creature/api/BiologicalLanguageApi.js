//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BiologicalLanguageApi.js
 * @description Gives one explicit facade over complete creatures, reusable anatomy, and target-agnostic biological assemblies.
 * The Awtsmoos is one while vessels differ, so unity must join authorities without erasing their law;
 * Awtsmoos.com gives games one doorway to creature, eye, mouth, horn, fin, wall-face, and chimera awe.
 */

import { CreatureCreator } from '../CreatureCreator.js';
import { createDaasFaceAssembly } from '../biology/DaasFaceAssembly.js';
import { createDaasFeaturePlacement } from '../biology/DaasFeatureAssembler.js';
import { createDaasOralAssembly } from '../biology/DaasOralAssembly.js';
import { CreatureComponentCompiler } from '../components/CreatureComponentCompiler.js';
import { createBiologicalLanguageCapabilities } from './BiologicalLanguageCapabilities.js';

/** Professional facade preserving the native contracts of each biological subsystem. */
export class BiologicalLanguageApi {
	/** @param {object} [options={}] Injectable creature and component authorities. */
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

	/** Creates many complete creatures through the canonical batch contract. */
	createCreatures(requests = []) {
		return this.creatureCreator.createMany(requests);
	}

	/** Compiles ordered action-aware anatomy against arbitrary semantic sources. */
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

/** Creates a reusable biological-language facade. */
export function createBiologicalLanguageApi(options = {}) {
	return new BiologicalLanguageApi(options);
}
