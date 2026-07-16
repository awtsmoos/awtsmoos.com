// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	BUILTIN_ANIMAL_ARCHETYPES
} from "./builtinArchetypes.js";

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
		this.archetypes.set(archetype.id, Object.freeze(
			JSON.parse(JSON.stringify(archetype))
		));
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
	return archetype;
}

export function resolveAnimalArchetype(archetypeId) {
	return animalArchetypeRegistry.resolve(archetypeId);
}

export function listAnimalArchetypes() {
	return animalArchetypeRegistry.list();
}
