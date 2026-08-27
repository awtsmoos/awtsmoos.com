// B"H
// Boruch Hashem
// Blessed is He
/** Universal executors receive plain values while canonical storage remains sealed. */

import { decodeCanonicalValue } from "../foundation/canonical/index.js";
import { GraphExecutorRegistry } from "../foundation/graphs/GraphExecutorRegistry.js";

function decodeRecord(record) {
	return Object.freeze(Object.fromEntries(
		Object.entries(record).map(([name, value]) => [name, decodeCanonicalValue(value)])
	));
}

export class UniversalNodeExecutorRegistry {
	#registry = new GraphExecutorRegistry();

	register(input) {
		if (!input || typeof input !== "object" || typeof input.executor !== "function") {
			throw new TypeError("Universal node registration requires an executor function.");
		}
		const executor = input.executor;
		return this.#registry.register({
			definition: input.definition,
			executor: payload => executor(Object.freeze({
				...payload,
				inputs: decodeRecord(payload.inputs),
				config: decodeCanonicalValue(payload.config),
				seed: decodeCanonicalValue(payload.seed)
			}))
		});
	}

	has(name, version) {
		return this.#registry.has(name, version);
	}

	resolve(name, version) {
		return this.#registry.resolve(name, version);
	}

	list() {
		return this.#registry.list();
	}

	get size() {
		return this.#registry.size;
	}
}
