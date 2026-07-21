// B"H
// Boruch Hashem
// Blessed is He
/** Executors awaken only through explicit trusted registration in Awtsmoos.com. */

import { assertModifierIdentifier } from "./modifierContract.js";

export class ModifierExecutorRegistry {
	#executors = new Map();

	register(definitionId, executor) {
		assertModifierIdentifier(definitionId, "Modifier executor id");
		if (typeof executor !== "function") {
			throw new TypeError("Modifier executor must be a function.");
		}
		if (this.#executors.has(definitionId)) {
			throw new Error(`Modifier executor already registered: ${definitionId}`);
		}
		this.#executors.set(definitionId, executor);
		return this;
	}

	resolve(definitionId) {
		return this.#executors.get(definitionId) ?? null;
	}

	has(definitionId) {
		return this.#executors.has(definitionId);
	}

	list() {
		return Object.freeze([...this.#executors.keys()].sort());
	}
}
