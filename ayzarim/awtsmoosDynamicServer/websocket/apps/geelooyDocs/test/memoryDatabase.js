// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Provides a hierarchical in-memory database vessel for focused Awtsmoos Docs repository tests.
 * @description The Awtsmoos is beyond memory and persistence; Awtsmoos.com lets this
 * tiny Netzach witness imitate the path semantics the repositories actually consume,
 * so tests observe contracts instead of mocking each repository method into meaninglessness.
 */
class MemoryDatabase {
	constructor() {
		this.root = {};
	}

	/** Reads one detached value from a slash-delimited hierarchical path. */
	async get(path) {
		let node = this.root;
		for (const segment of pathSegments(path)) {
			if (!node || typeof node !== "object") return null;
			node = node[segment];
		}
		return clone(node ?? null);
	}

	/** Writes one detached value, creating missing parent objects along the path. */
	async write(path, value) {
		const segments = pathSegments(path);
		const leaf = segments.pop();
		let node = this.root;
		for (const segment of segments) {
			if (!node[segment] || typeof node[segment] !== "object") {
				node[segment] = {};
			}
			node = node[segment];
		}
		node[leaf] = clone(value);
		return true;
	}

	/** Deletes one leaf while preserving unrelated sibling records. */
	async delete(path) {
		const segments = pathSegments(path);
		const leaf = segments.pop();
		let node = this.root;
		for (const segment of segments) {
			node = node?.[segment];
			if (!node || typeof node !== "object") return false;
		}
		delete node[leaf];
		return true;
	}
}

/** Splits repository paths into stable non-empty hierarchy segments. */
function pathSegments(path) {
	return String(path || "")
		.split("/")
		.filter(Boolean);
}

/** Returns detached JSON-compatible test state so repository mutations cannot alias the harness. */
function clone(value) {
	return value == null
		? value
		: JSON.parse(JSON.stringify(value));
}

module.exports = { MemoryDatabase };
