// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	isProceduralOperationName
} from "../constants/proceduralObjectContract.js";

/**
 * Trusted registry connecting declarative operation names to core or adapter
 * executors. Recipes may name extension operations, but only explicitly
 * registered trusted handlers can execute them.
 */
export class ProceduralOperationRegistry {
	constructor() {
		this.entries = new Map();
	}

	register(operation, definition = {}) {
		if (!isProceduralOperationName(operation)) {
			throw new Error(`B"H | Invalid procedural operation name: ${operation}`);
		}
		this.entries.set(operation, Object.freeze({
			operation,
			executor: definition.executor || "core",
			handler: definition.handler || null,
			capabilities: Object.freeze({...definition.capabilities})
		}));
		return this;
	}

	resolve(operation) {
		const definition = this.entries.get(operation);
		if (!definition) {
			throw new Error(`B"H | Operation is not registered: ${operation}`);
		}
		return definition;
	}

	has(operation) {
		return this.entries.has(operation);
	}

	list() {
		return Array.from(this.entries.values());
	}
}
