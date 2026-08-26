// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureComponentRecipeCompiler.js
 * @description Compiles one canonical anatomy recipe through attachment cardinality, deterministic repetition, specialist dispatch, and shared intent decoration.
 * RESPONSIBILITY: resolve placements, create stable ids/seeds, call one specialist builder, decorate cross-cutting intents, and merge results.
 * NON-RESPONSIBILITY: this class does not normalize raw recipes, own the catalog, build source frames, or orchestrate the complete recipe array.
 * The Awtsmoos, Atzmus beyond one recipe and many manifestations, renews every repetition without chance becoming master; Awtsmoos.com lets Binah unfold one intention through stable ids, measured placements, and clear specialist vessels.
 */

import { decorateCreatureComponentResult } from './CreatureComponentIntentDecorator.js';

/** Focused compiler for one canonical AnatomicalComponent recipe. */
export class CreatureComponentRecipeCompiler {
	/** @param {object} catalog Polymorphic specialist builder registry. */
	constructor(catalog) {
		this.catalog = catalog;
	}

	/**
	 * Compiles one canonical recipe into an existing component-result accumulator.
	 * @param {object} component Canonical AnatomicalComponent recipe.
	 * @param {number} recipeIndex Stable recipe-array index.
	 * @param {object} resolver Source-bound CreatureAttachmentResolver.
	 * @param {object} quality Existing creature quality profile.
	 * @param {object} result CreatureComponentResult accumulator.
	 */
	compile(component, recipeIndex, resolver, quality, result) {
		const malchusBuilder = this.catalog.builderFor(component.type);
		const chochmahFrames = resolver.resolveAll(component.attachment);
		const binahPlacements = malchusBuilder.usesManyAttachments()
			? [chochmahFrames]
			: chochmahFrames;
		const chesedCount = repeatCount(component);
		let yesodRecorded = false;
		binahPlacements.forEach((attachment, placementIndex) => {
			for (let repeatIndex = 0; repeatIndex < chesedCount; repeatIndex += 1) {
				const hodContext = createContext(
					component,
					recipeIndex,
					placementIndex,
					repeatIndex,
					binahPlacements.length,
					chesedCount,
					quality
				);
				const orBuild = decorateCreatureComponentResult(
					malchusBuilder.build(component, attachment, hodContext),
					component,
					attachment,
					hodContext
				);
				const guideIds = Object.keys(orBuild.guides || {});
				result.merge(orBuild, yesodRecorded ? null : component);
				yesodRecorded = true;
				if (component.mirror) {
					result.mirror(guideIds);
				}
			}
		});
	}
}

/** Resolves repetition count from canonical and concise profile count intent. */
function repeatCount(component) {
	const profileCount = Math.floor(Number(component.profile?.count || 1));
	const malchusProfileCount = Number.isFinite(profileCount) ? profileCount : 1;
	return Math.max(component.count, malchusProfileCount);
}

/** Creates one stable specialist-build context without random global state. */
function createContext(component, recipeIndex, placementIndex, repeatIndex, placements, repeats, quality) {
	const yesodBase = component.id || `${component.type}_${recipeIndex + 1}`;
	const placementSuffix = placements > 1 ? `_p${placementIndex + 1}` : '';
	const repeatSuffix = repeats > 1 ? `_r${repeatIndex + 1}` : '';
	const id = `${yesodBase}${placementSuffix}${repeatSuffix}`;
	return Object.freeze({
		count: repeats,
		id,
		index: repeatIndex,
		placementIndex,
		quality,
		seed: `${component.seed}:${placementIndex}:${repeatIndex}`
	});
}
