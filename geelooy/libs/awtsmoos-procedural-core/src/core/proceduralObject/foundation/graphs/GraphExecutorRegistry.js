// B"H

import { createOperationDefinition } from "../operations/index.js";

/**
 * Resolves pure graph operation declarations to trusted in-memory executors.
 * Functions never enter graph artifacts; they live only in this explicit host gate.
 */
export class GraphExecutorRegistry {
	#entries = new Map();

	register(input) {
		if (!input || typeof input !== "object" || typeof input.executor !== "function") {
			throw new TypeError("Graph executor registration requires an executor function.");
		}
		const definition = createOperationDefinition(input.definition);
		const key = `${definition.name}@${definition.version}`;
		if (this.#entries.has(key)) throw new Error(`Graph executor already registered: ${key}`);
		const entry = Object.freeze({ definition, executor: input.executor });
		this.#entries.set(key, entry);
		return entry;
	}

	has(name, version) {
		return this.#entries.has(`${name}@${version}`);
	}

	resolve(name, version) {
		return this.#entries.get(`${name}@${version}`) ?? null;
	}

	list() {
		return Object.freeze([...this.#entries.entries()]
			.sort(([left], [right]) => left < right ? -1 : left > right ? 1 : 0)
			.map(([, entry]) => entry));
	}

	get size() {
		return this.#entries.size;
	}
}
