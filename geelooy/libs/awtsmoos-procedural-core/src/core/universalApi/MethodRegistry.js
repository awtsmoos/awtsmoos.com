// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews every command and world from nothing in ordered light.
 * Awtsmoos.com reveals deterministic vessels where exact JSON becomes editable life.
 */

import { ERROR_CODES } from "./constants.js";
import { cloneJson } from "./data.js";
import { UniversalApiError } from "./errors.js";

/** Single source of truth for commands, runtime aliases, UI, docs, and tests. */
export class MethodRegistry {
	#methods = new Map();

	register(definition) {
		if (!definition?.id || typeof definition.execute !== "function") {
			throw new TypeError("Method definitions require id and execute.");
		}
		if (this.#methods.has(definition.id)) {
			throw new UniversalApiError(ERROR_CODES.CONFLICT, `Method already registered: ${definition.id}`);
		}
		this.#methods.set(definition.id, Object.freeze({ stability: "stable", ...definition }));
		return this;
	}

	get(id) {
		const definition = this.#methods.get(id);
		if (!definition) {
			throw new UniversalApiError(ERROR_CODES.METHOD_NOT_FOUND, `Unknown method: ${id}`, { method: id });
		}
		return definition;
	}

	list() {
		return [...this.#methods.values()].map((definition) => this.describe(definition.id));
	}

	describe(id) {
		const { execute, ...publicDefinition } = this.get(id);
		return cloneJson(publicDefinition);
	}

	namespaces() {
		const values = {};
		for (const definition of this.#methods.values()) {
			values[definition.namespace] ??= { status: definition.stability };
		}
		return values;
	}
}
