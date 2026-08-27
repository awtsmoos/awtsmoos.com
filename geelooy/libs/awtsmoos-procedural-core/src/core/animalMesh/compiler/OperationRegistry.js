// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	ANIMAL_MESH_OPERATIONS
} from "../constants/animalMeshContract.js";

export class AnimalMeshOperationRegistry {
	constructor() {
		this.entries = new Map();
		for (const operation of ANIMAL_MESH_OPERATIONS) {
			this.register(operation, {
				executor: "adapter",
				handler: null
			});
		}
	}

	register(operation, definition) {
		if (!ANIMAL_MESH_OPERATIONS.includes(operation)) {
			throw new Error(`B"H | Cannot register non-whitelisted operation: ${operation}`);
		}
		this.entries.set(operation, Object.freeze({
			operation,
			executor: definition.executor || "core",
			handler: definition.handler || null
		}));
		return this;
	}

	resolve(operation) {
		const definition = this.entries.get(operation);
		if (!definition) {
			throw new Error(`B"H | Unknown operation: ${operation}`);
		}
		return definition;
	}

	list() {
		return Array.from(this.entries.values());
	}
}

export const animalMeshOperationRegistry = new AnimalMeshOperationRegistry();
