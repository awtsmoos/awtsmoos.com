// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureComponentCompiler.js
 * @description Compiles ordered reusable anatomy while allowing each generated guide to become a lawful source for later components.
 * The Awtsmoos renews cause and consequence in one continuous creation, yet each revealed form may guide the form after it;
 * Awtsmoos.com carries that truth as a live semantic graph so composition grows deeply without renderer coupling or hidden special cases.
 */

import { createAnatomicalComponent } from './AnatomicalComponent.js';
import { CreatureAttachmentResolver } from './CreatureAttachmentResolver.js';
import { CreatureComponentCatalog } from './CreatureComponentCatalog.js';
import { CreatureComponentRecipeCompiler } from './CreatureComponentRecipeCompiler.js';
import { CreatureComponentResult } from './CreatureComponentResult.js';
import { CreatureCompositionSourceGraph } from './CreatureCompositionSourceGraph.js';

/** Compiles ordered component recipes into one deterministic renderer-neutral result. */
export class CreatureComponentCompiler {
	/** @param {object} [options={}] Injectable catalog, resolver, recipe compiler, and source-graph factories. */
	constructor(options = {}) {
		this.catalog = options.catalog || new CreatureComponentCatalog();
		this.resolverFactory = options.resolverFactory
			|| (sources => new CreatureAttachmentResolver(sources));
		this.recipeCompiler = options.recipeCompiler
			|| new CreatureComponentRecipeCompiler(this.catalog);
		this.sourceGraphFactory = options.sourceGraphFactory
			|| (sources => new CreatureCompositionSourceGraph(sources));
	}

	/**
	 * Compiles components in caller order so later recipes may target earlier generated guides.
	 * @param {Array<object>} [recipes=[]] Anatomical component recipes.
	 * @param {object} [sources={}] Initial semantic attachment sources.
	 * @param {object} [quality={}] Renderer-neutral quality budget/profile.
	 * @returns {object} Frozen accumulated component result.
	 */
	compile(recipes = [], sources = {}, quality = {}) {
		const tiferesResult = new CreatureComponentResult();
		const yesodSourceGraph = this.sourceGraphFactory(sources);
		recipes.forEach((input, recipeIndex) => {
			const component = createAnatomicalComponent(input);
			const resolver = this.resolverFactory(yesodSourceGraph.snapshot());
			this.recipeCompiler.compile(
				component,
				recipeIndex,
				resolver,
				quality,
				tiferesResult
			);
			yesodSourceGraph.absorb(component, recipeIndex, tiferesResult);
		});
		return tiferesResult.finish();
	}
}
