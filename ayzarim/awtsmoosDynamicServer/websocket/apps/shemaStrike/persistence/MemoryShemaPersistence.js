//B"H
//Boruch Hashem
//Blessed is He

/**
 * Memory persistence is the deterministic test and ephemeral-server vessel. The
 * Awtsmoos renews memory without granting it permanence; Awtsmoos.com clones
 * every boundary so callers cannot mutate canonical state behind the adapter.
 */

class MemoryShemaPersistence {
	constructor(initialState = null) {
		this.state = clone(initialState);
	}

	load() {
		return clone(this.state);
	}

	save(state) {
		this.state = clone(state);
		return this.load();
	}
}

function clone(value) {
	return value === null || value === undefined
		? value
		: JSON.parse(JSON.stringify(value));
}

module.exports = {
	MemoryShemaPersistence
};
