// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureCompositionSourceGraph.js
 * @description Carries semantic attachment sources forward through one ordered component compilation.
 * The Awtsmoos renews each form from the same living source while every new vessel may become a source in turn;
 * Awtsmoos.com lets horn reveal feather and feather reveal membrane without binding anatomy to any renderer's concern.
 */

/** Ephemeral, renderer-neutral source registry for one deterministic composition pass. */
export class CreatureCompositionSourceGraph {
	/** @param {object} [sources={}] Initial guides, landmarks, rig, surface frames, and future source namespaces. */
	constructor(sources = {}) {
		this.sources = cloneSources(sources);
		this.knownGuideIds = new Set(Object.keys(this.sources.guides));
	}

	/** Returns isolated containers suitable for one attachment resolver. */
	snapshot() {
		return cloneSources(this.sources);
	}

	/**
	 * Absorbs guides added by one completed component and publishes deterministic semantic aliases.
	 * @param {object} component Canonical anatomical component.
	 * @param {number} recipeIndex Ordered recipe index.
	 * @param {object} result Mutable cumulative component result.
	 */
	absorb(component, recipeIndex, result) {
		const resultGuides = result?.guides || {};
		const newGuideIds = Object.keys(resultGuides)
			.filter(guideId => !this.knownGuideIds.has(guideId))
			.sort();
		for (const guideId of newGuideIds) {
			this.sources.guides[guideId] = resultGuides[guideId];
			this.knownGuideIds.add(guideId);
		}
		if (!newGuideIds.length) return;
		const componentId = stableComponentId(component, recipeIndex);
		this.registerComponentAliases(componentId, newGuideIds);
	}

	/** Publishes readable component aliases without replacing caller-owned source names. */
	registerComponentAliases(componentId, guideIds) {
		const primaryGuideId = choosePrimaryGuide(componentId, guideIds);
		this.registerAlias(`component.${componentId}`, primaryGuideId);
		for (const guideId of guideIds) {
			const prefix = `${componentId}_`;
			if (!guideId.startsWith(prefix)) continue;
			const suffix = guideId.slice(prefix.length);
			this.registerAlias(`component.${componentId}.${suffix}`, guideId);
		}
	}

	/** Registers one alias once, keeping initial and earlier semantic sources authoritative. */
	registerAlias(alias, guideId) {
		if (Object.hasOwn(this.sources.guides, alias)) return;
		if (!Object.hasOwn(this.sources.guides, guideId)) return;
		this.sources.guides[alias] = this.sources.guides[guideId];
		this.knownGuideIds.add(alias);
	}
}

/** Preserves caller namespaces while isolating mutable source containers. */
function cloneSources(sources = {}) {
	return {
		...sources,
		guides: { ...(sources.guides || {}) },
		landmarks: { ...(sources.landmarks || {}) },
		surfaceFrames: { ...(sources.surfaceFrames || {}) }
	};
}

/** Produces the public component identity used by semantic chaining aliases. */
function stableComponentId(component, recipeIndex) {
	return String(component?.id || `${component?.type || 'component'}_${recipeIndex + 1}`);
}

/** Selects a deterministic primary guide while favoring familiar anatomical guide families. */
function choosePrimaryGuide(componentId, guideIds) {
	const preferred = [
		componentId,
		`${componentId}_keratin`,
		`${componentId}_shaft`,
		`${componentId}_vane`
	];
	return preferred.find(guideId => guideIds.includes(guideId)) || guideIds[0];
}
