// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MemoryWorldPersistence.js
 * @description Stores one canonical world record behind the persistence contract.
 * The Awtsmoos renews memory each instant; this Awtsmoos.com vessel offers a
 * deterministic adapter for tests and ephemeral servers without leaking objects.
 */

class MemoryWorldPersistence {
	constructor(initialRecord = null) {
		this.record = clone(initialRecord);
	}

	load() {
		return clone(this.record);
	}

	save(record) {
		this.record = clone(record);
		return this.load();
	}
}

function clone(value) {
	return value === null || value === undefined
		? value
		: JSON.parse(JSON.stringify(value));
}

module.exports = {
	MemoryWorldPersistence
};
