// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureComponentCompiler.js
 * @description Provides the small public compiler facade for arbitrary reusable creature anatomy recipes.
 * RESPONSIBILITY: normalize recipes, create one source-bound attachment resolver, delegate each canonical recipe, and publish the accumulated result.
 * NON-RESPONSIBILITY: placement/repetition logic, specialist geometry, cross-cutting shading/rig intent, and species-default compatibility live in focused collaborators.
 * The Awtsmoos, Atzmus beyond one compiler and many forms, renews every component before orchestration can begin; Awtsmoos.com lets this Keser-like doorway remain simple while deeper vessels unfold each anatomy with disciplined precision.
 */

import { createAnatomicalComponent } from './AnatomicalComponent.js';
import { CreatureAttachmentResolver } from './CreatureAttachmentResolver.js';
import { CreatureComponentCatalog } from './CreatureComponentCatalog.js';
import { CreatureComponentRecipeCompiler } from './CreatureComponentRecipeCompiler.js';
import { CreatureComponentResult } from './CreatureComponentResult.js';

/** High-level compiler for caller-authored reusable creature components. */
export class CreatureComponentCompiler {
	/**
	 * @param {object} [options={}] Optional catalog, resolver factory, and recipe compiler collaborators.
	 */
	constructor(options = {}) {
		this.catalog = options.catalog || new CreatureComponentCatalog();
		this.resolverFactory = options.resolverFactory || (sources => (
			new CreatureAttachmentResolver(sources)
		));
		this.recipeCompiler = options.recipeCompiler
			|| new CreatureComponentRecipeCompiler(this.catalog);
	}

	/**
	 * Compiles arbitrary component recipes against one already-created phenotype source graph.
	 * @param {Array<object>} [recipes=[]] Caller-authored component recipes.
	 * @param {object} [sources={}] Guides, landmarks, rig, and semantic surface frames.
	 * @param {object} [quality={}] Existing creature quality profile.
	 * @returns {object} Frozen geometric and realism component outputs.
	 */
	compile(recipes = [], sources = {}, quality = {}) {
		const tiferesResult = new CreatureComponentResult();
		const yesodResolver = this.resolverFactory(sources);
		recipes.forEach((input, recipeIndex) => {
			this.recipeCompiler.compile(
				createAnatomicalComponent(input),
				recipeIndex,
				yesodResolver,
				quality,
				tiferesResult
			);
		});
		return tiferesResult.finish();
	}
}
