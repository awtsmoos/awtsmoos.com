// B"H
// Boruch Hashem
// Blessed is He
/** Generators enter the Awtsmoos.com host only through explicit trusted registration. */

export class AssetGeneratorRegistry {
	#generators = new Map();

	register(id, generator) {
		if (typeof id !== "string" || !id.trim()) throw new TypeError("Generator id must be non-empty text.");
		if (typeof generator !== "function") throw new TypeError("Generator must be a function.");
		if (this.#generators.has(id)) throw new Error(`Asset generator already registered: ${id}`);
		this.#generators.set(id, generator);
		return this;
	}

	resolve(id) {
		return this.#generators.get(id) ?? null;
	}

	list() {
		return Object.freeze([...this.#generators.keys()].sort());
	}
}
