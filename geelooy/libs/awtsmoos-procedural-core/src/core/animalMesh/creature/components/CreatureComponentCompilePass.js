//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureComponentCompilePass.js
 * @description Executes one ordered component pass over a living semantic source graph.
 * The Awtsmoos renews each cause as consequence becomes a source once more;
 * Awtsmoos.com lets later anatomy drink from guides that earlier anatomy bore.
 */

import { createAnatomicalComponent } from './AnatomicalComponent.js';
import { CreatureComponentResult } from './CreatureComponentResult.js';

/** Compiles recipes in order while promoting each result into the next resolver context. */
export function compileCreatureComponentPass(options = {}) {
	const {
		recipes = [],
		quality = {},
		recipeCompiler,
		resolverFactory,
		sourceGraph
	} = options;
	const tiferesResult = new CreatureComponentResult();
	recipes.forEach((input, recipeIndex) => {
		const component = createAnatomicalComponent(input);
		const resolver = resolverFactory(sourceGraph.snapshot());
		recipeCompiler.compile(component, recipeIndex, resolver, quality, tiferesResult);
		sourceGraph.absorb(component, recipeIndex, tiferesResult);
	});
	return tiferesResult.finish();
}
