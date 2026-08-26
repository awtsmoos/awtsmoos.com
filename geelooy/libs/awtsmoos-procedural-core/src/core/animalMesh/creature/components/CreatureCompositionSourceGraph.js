//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureCompositionSourceGraph.js
 * @description Carries semantic attachment sources through one ordered component compilation.
 * The Awtsmoos renews each vessel while every revealed form may guide the form that follows;
 * Awtsmoos.com lets horn reveal feather and feather reveal membrane without renderer-specific laws.
 */

import {
	chooseCreatureCompositionPrimaryGuide,
	creatureCompositionComponentId,
	creatureCompositionGuideAliases
} from './CreatureCompositionSourceAliases.js';

/** Ephemeral, renderer-neutral source registry for one deterministic composition pass. */
export class CreatureCompositionSourceGraph {
	/** @param {object} [sources={}] Initial semantic attachment namespaces. */
	constructor(sources = {}) {
		this.yesodSources = cloneCreatureCompositionSources(sources);
		this.knownGuideIds = new Set(Object.keys(this.yesodSources.guides));
	}

	/** Returns isolated source containers for one attachment resolver. */
	snapshot() {
		return cloneCreatureCompositionSources(this.yesodSources);
	}

	/** Absorbs guides created by one component and publishes stable semantic aliases. */
	absorb(component, recipeIndex, result) {
		const resultGuides = result?.guides || {};
		const newGuideIds = Object.keys(resultGuides)
			.filter(guideId => !this.knownGuideIds.has(guideId))
			.sort();
		for (const guideId of newGuideIds) {
			this.yesodSources.guides[guideId] = resultGuides[guideId];
			this.knownGuideIds.add(guideId);
		}
		if (!newGuideIds.length) return;
		this.registerComponentAliases(
			creatureCompositionComponentId(component, recipeIndex),
			newGuideIds
		);
	}

	/** Publishes readable component aliases without replacing existing semantic sources. */
	registerComponentAliases(componentId, guideIds) {
		const primaryGuideId = chooseCreatureCompositionPrimaryGuide(componentId, guideIds);
		this.registerAlias(`component.${componentId}`, primaryGuideId);
		for (const { alias, guideId } of creatureCompositionGuideAliases(componentId, guideIds)) {
			this.registerAlias(alias, guideId);
		}
	}

	/** Registers one generated alias once. */
	registerAlias(alias, guideId) {
		if (Object.hasOwn(this.yesodSources.guides, alias)) return;
		if (!Object.hasOwn(this.yesodSources.guides, guideId)) return;
		this.yesodSources.guides[alias] = this.yesodSources.guides[guideId];
		this.knownGuideIds.add(alias);
	}
}

/** Clones mutable source namespaces while preserving opaque rig and future contracts. */
function cloneCreatureCompositionSources(sources = {}) {
	return {
		...sources,
		guides: { ...(sources.guides || {}) },
		landmarks: { ...(sources.landmarks || {}) },
		surfaceFrames: { ...(sources.surfaceFrames || {}) }
	};
}
