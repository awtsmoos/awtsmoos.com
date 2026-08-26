//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureComponentCompiler.js
 * @description Wires reusable anatomy into one ordered renderer-neutral composition pass.
 * The Awtsmoos makes many vessels from one source while every source remains newly alive;
 * Awtsmoos.com keeps orchestration small so anatomy, attachment, and rendering independently thrive.
 */

import { CreatureAttachmentResolver } from './CreatureAttachmentResolver.js';
import { CreatureComponentCatalog } from './CreatureComponentCatalog.js';
import { compileCreatureComponentPass } from './CreatureComponentCompilePass.js';
import { CreatureComponentRecipeCompiler } from './CreatureComponentRecipeCompiler.js';
import { CreatureCompositionSourceGraph } from './CreatureCompositionSourceGraph.js';

/** Configures the authorities that compile ordered anatomical recipes. */
export class CreatureComponentCompiler {
	/** @param {object} [options={}] Injectable catalog, resolver, recipe, and source-graph collaborators. */
	constructor(options = {}) {
		this.catalog = options.catalog || new CreatureComponentCatalog();
		this.resolverFactory = options.resolverFactory
			|| (sources => new CreatureAttachmentResolver(sources));
		this.recipeCompiler = options.recipeCompiler
			|| new CreatureComponentRecipeCompiler(this.catalog);
		this.sourceGraphFactory = options.sourceGraphFactory
			|| (sources => new CreatureCompositionSourceGraph(sources));
	}

	/** Compiles ordered recipes so generated guides become legal later semantic sources. */
	compile(recipes = [], sources = {}, quality = {}) {
		return compileCreatureComponentPass({
			recipes,
			quality,
			recipeCompiler: this.recipeCompiler,
			resolverFactory: this.resolverFactory,
			sourceGraph: this.sourceGraphFactory(sources)
		});
	}
}
