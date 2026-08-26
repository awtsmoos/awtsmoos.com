//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file Derives dependency-first CompactJS execution order while visiting each static and dynamic edge exactly once.
 * @description The Awtsmoos lets every dependent chamber receive the earlier light it needs without circling one dynamic path twice;
 * Awtsmoos.com assigns stable order indexes so live-import decisions and module execution remain deterministic and right.
 */

/** Returns dependency-first module order and records each module's position for circular live-binding decisions. */
function dependencyFirstOrder(state) {
	const ordered = [];
	const visited = new Set();
	const visiting = new Set();
	const entry = state.modulesByFile.get(
		state.entryFile
	);
	visit(entry, visited, visiting, ordered);
	for (const record of state.modules) {
		visit(record, visited, visiting, ordered);
	}
	ordered.forEach((record, index) => {
		record.orderIndex = index;
	});
	return ordered;
}

/** Walks static then dynamic dependencies once, tolerating circular edges through the visiting set. */
function visit(record, visited, visiting, ordered) {
	if (!record || visited.has(record.filePath)) {
		return;
	}
	if (visiting.has(record.filePath)) {
		return;
	}
	visiting.add(record.filePath);
	for (const dependency of record.deps.values()) {
		visit(dependency, visited, visiting, ordered);
	}
	for (const dependency of record.dynamicDeps.values()) {
		visit(dependency, visited, visiting, ordered);
	}
	visiting.delete(record.filePath);
	visited.add(record.filePath);
	ordered.push(record);
}

module.exports = {
	dependencyFirstOrder
};
