// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DaasFeatureAssembler.js
 * @description Bridges reusable biological definitions into the existing immutable Briah part/Yesod attachment flow.
 * The Awtsmoos gives Daas the power to know feature and target without confusing the two;
 * Awtsmoos.com lets eye meet wall or fin meet cow through one descriptor whose semantic bond stays true.
 */

import { attachCreaturePart } from "../anatomy/parts.js";

/**
 * Creates a detached placement descriptor that also survives the narrow Briah part schema.
 * @param {object} definition Canonical biological definition.
 * @param {object} input Placement, parameter, transform, and target overrides.
 * @returns {object} Plain renderer-neutral placement descriptor.
 */
export function createDaasFeaturePlacement(definition, input = {}) {
	if (!definition?.id) {
		throw new TypeError('B"H | Biological feature definition requires a stable id.');
	}
	const metadata = {
		...definition.metadata,
		...(input.metadata || {})
	};
	return {
		id: input.id,
		partDefinitionId: definition.id,
		definitionVersion: definition.version,
		semanticCategory: definition.category,
		parameters: {
			biologicalGeometryRecipe: input.geometryRecipe || definition.geometryRecipe,
			biologicalMetadata: metadata,
			...definition.parameters,
			...(input.parameters || {})
		},
		anchor: { ...(input.anchor || {}) },
		transform: {
			position: [0, 0, 0],
			rotation: [0, 0, 0],
			scale: [1, 1, 1],
			...(input.transform || {})
		},
		rigContribution: {
			...definition.rigContribution,
			...(input.rigContribution || {})
		},
		skinningContribution: {
			...definition.skinningContribution,
			...(input.skinningContribution || {})
		},
		contactRegions: [...definition.contactRegions],
		collision: { ...definition.collision, ...(input.collision || {}) },
		materialRegions: [...definition.materialRegions],
		animationControls: [...definition.animationControls],
		functionalCapabilities: {
			...definition.capabilities,
			...(input.functionalCapabilities || {})
		},
		metadata,
		target: input.target || "briah-creature"
	};
}

/** Attaches one biological definition through the current Briah part mutation API. */
export function attachDaasBiologicalFeature(creature, definition, input = {}) {
	return attachCreaturePart(
		creature,
		createDaasFeaturePlacement(definition, input)
	);
}

/** Attaches an ordered biological assembly while preserving deterministic caller order. */
export function attachDaasBiologicalAssembly(creature, entries = []) {
	return entries.reduce((current, entry) => {
		return attachDaasBiologicalFeature(
			current,
			entry.definition,
			entry.input || {}
		);
	}, creature);
}

/** Class façade for discovery in class-oriented callers. */
export class DaasFeatureAssembler {
	static placement(definition, input = {}) {
		return createDaasFeaturePlacement(definition, input);
	}

	static attach(creature, definition, input = {}) {
		return attachDaasBiologicalFeature(creature, definition, input);
	}

	static attachMany(creature, entries = []) {
		return attachDaasBiologicalAssembly(creature, entries);
	}
}
