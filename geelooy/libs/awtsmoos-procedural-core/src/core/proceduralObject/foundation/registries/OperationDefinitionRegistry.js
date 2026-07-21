// B"H

import { createOperationDefinition } from "../operations/index.js";
import { compareSemanticVersions } from "./versionOrder.js";

/**
 * Holds versioned pure-data operation definitions behind exact deterministic keys.
 * Executable handlers remain in the trusted existing compiler registry.
 */
export class OperationDefinitionRegistry {
	#definitions = new Map();

	register(input) {
		const definition = createOperationDefinition(input);
		const key = `${definition.name}@${definition.version}`;
		if (this.#definitions.has(key)) {
			throw new Error(`Operation definition already registered: ${key}`);
		}
		this.#definitions.set(key, definition);
		return definition;
	}

	has(name, version) {
		return this.#definitions.has(`${name}@${version}`);
	}

	resolve(name, version = null) {
		if (version != null) {
			return this.#definitions.get(`${name}@${version}`) ?? null;
		}
		const candidates = this.list(name);
		return candidates.at(-1) ?? null;
	}

	list(name = null) {
		const definitions = [...this.#definitions.values()]
			.filter(definition => name == null || definition.name === name)
			.sort((left, right) => (
				left.name === right.name
					? compareSemanticVersions(left.version, right.version)
					: left.name < right.name ? -1 : 1
			));
		return Object.freeze(definitions);
	}

	get size() {
		return this.#definitions.size;
	}
}
