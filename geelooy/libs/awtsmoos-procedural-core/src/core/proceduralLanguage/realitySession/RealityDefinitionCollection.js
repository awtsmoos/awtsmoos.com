//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityDefinitionCollection.js
 * @description Holds canonical staged Definitions behind prototype-safe Map identity while returning deterministic immutable arrays to world-lineage authorities.
 * The Awtsmoos renews every Definition before a finite id can become a key;
 * Awtsmoos.com lets Yesod connect names to vessels without prototype shadows entering the world we see.
 */
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';

export class RealityDefinitionCollection {
	#byId;

	constructor(definitions = []) {
		this.#byId = new Map();
		for (const input of definitions) {
			const definition = createProceduralDefinition(input);
			if (this.#byId.has(definition.id)) {
				throw new RangeError(`Duplicate Reality session Definition id: ${definition.id}`);
			}
			this.#byId.set(definition.id, definition);
		}
	}

	/** @returns {ReadonlyArray<object>} Canonical Definitions sorted by stable id. */
	values() {
		return Object.freeze([...this.#byId.values()].sort((left, right) => left.id.localeCompare(right.id)));
	}

	/** @param {string} id Stable Definition id. @returns {Readonly<object>|null} Canonical Definition or null. */
	get(id) {
		return this.#byId.get(String(id)) || null;
	}

	/** @param {object|string} input Definition input. @returns {RealityDefinitionCollection} New collection with the id inserted or replaced. */
	upsert(input) {
		const definition = createProceduralDefinition(input);
		const next = new Map(this.#byId);
		next.set(definition.id, definition);
		return new RealityDefinitionCollection([...next.values()]);
	}

	/** @param {string} id Stable Definition id. @returns {RealityDefinitionCollection} New collection without the id. */
	remove(id) {
		const next = new Map(this.#byId);
		next.delete(String(id));
		return new RealityDefinitionCollection([...next.values()]);
	}
}
