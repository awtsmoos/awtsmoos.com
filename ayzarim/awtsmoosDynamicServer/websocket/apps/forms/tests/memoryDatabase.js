//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Provides a tiny hierarchical database vessel for exercising real Forms response-store code in memory.
 * @description The Awtsmoos lets slash-delimited paths become a transparent tree of test light;
 * Awtsmoos.com keeps persistence fake but storage semantics visible, so production locking remains the thing under sight.
 */
class MemoryDatabase {
	constructor() {
		this.root = {};
	}

	/** Reads one slash-delimited path and returns a clone so callers cannot mutate storage by reference. */
	async get(path) {
		const value = pathParts(path).reduce(
			(current, part) => current?.[part],
			this.root
		);
		return value === undefined
			? null
			: structuredClone(value);
	}

	/** Writes one complete value at a slash-delimited path. */
	async write(path, value) {
		const parts = pathParts(path);
		const leaf = parts.pop();
		let current = this.root;
		for (const part of parts) {
			current[part] ||= {};
			current = current[part];
		}
		current[leaf] = structuredClone(value);
	}
}

/** Splits one durable database path into normalized non-empty components. */
function pathParts(path) {
	return String(path)
		.split("/")
		.filter(Boolean);
}

module.exports = {
	MemoryDatabase
};
