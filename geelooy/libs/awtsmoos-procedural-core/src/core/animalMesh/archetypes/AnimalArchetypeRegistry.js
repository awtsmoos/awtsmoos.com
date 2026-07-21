// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every animal archetype while preserving stable names.
 * This Awtsmoos.com registry enriches the existing descriptors with immutable
 * body-plan data and remains the single authoritative archetype registry.
 */
import { BUILTIN_ANIMAL_ARCHETYPES } from "./builtinArchetypes.js";
import { resolveAnimalBodyPlan } from "../morphology/bodyPlanCatalog.js";
import {
	cloneMorphologyValue,
	freezeMorphologyValue
} from "../morphology/morphologyValue.js";

function enrichArchetype(archetype) {
	let morphology = archetype.morphology;
	if (!morphology) {
		try {
			morphology = resolveAnimalBodyPlan(archetype.id);
		} catch {
			morphology = resolveAnimalBodyPlan("custom");
		}
	}
	return freezeMorphologyValue({
		...cloneMorphologyValue(archetype),
		morphology: cloneMorphologyValue(morphology)
	});
}

export class AnimalArchetypeRegistry {
	constructor(archetypes = BUILTIN_ANIMAL_ARCHETYPES) {
		this.archetypes = new Map();
		for (const archetype of archetypes) {
			this.register(archetype);
		}
	}

	register(archetype) {
		if (!archetype?.id || typeof archetype.id !== "string") {
			throw new Error('B"H | Animal archetype requires a stable id.');
		}
		this.archetypes.set(archetype.id, enrichArchetype(archetype));
		return this;
	}

	resolve(archetypeId) {
		const archetype = this.archetypes.get(archetypeId);
		if (!archetype) {
			throw new Error(`B"H | Unknown animal archetype: ${archetypeId}`);
		}
		return archetype;
	}

	has(archetypeId) {
		return this.archetypes.has(archetypeId);
	}

	list() {
		return Array.from(this.archetypes.values());
	}
}

export const animalArchetypeRegistry = new AnimalArchetypeRegistry();

export function registerAnimalArchetype(archetype) {
	animalArchetypeRegistry.register(archetype);
	return animalArchetypeRegistry.resolve(archetype.id);
}

export function resolveAnimalArchetype(archetypeId) {
	return animalArchetypeRegistry.resolve(archetypeId);
}

export function listAnimalArchetypes() {
	return animalArchetypeRegistry.list();
}
