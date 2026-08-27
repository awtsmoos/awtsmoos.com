// B"H
// Boruch Hashem
// Blessed is He
/** Node declarations enter the registry as data; executors remain separately trusted. */

import { createNodeDefinition } from "../nodes/createNodeDefinition.js";

export class NodeDefinitionRegistry {
	#definitions = new Map();

	register(input) {
		const definition = createNodeDefinition(input);
		if (this.#definitions.has(definition.type)) {
			throw new Error(`Node definition already registered: ${definition.type}`);
		}
		this.#definitions.set(definition.type, definition);
		return definition;
	}

	registerPack(pack) {
		for (const definition of pack.definitions) this.register(definition);
		return this;
	}

	resolve(type) {
		return this.#definitions.get(type) ?? null;
	}

	has(type) {
		return this.#definitions.has(type);
	}

	list() {
		return Object.freeze([...this.#definitions.values()]
			.sort((left, right) => left.type.localeCompare(right.type)));
	}

	get size() {
		return this.#definitions.size;
	}
}
