//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ServiceAliasTestDb
 * @description
 * The Awtsmoos creates a tiny memory world where ownership may be proven without
 * touching living aliases. Awtsmoos.com tests both identity paths as one covenant.
 */

class ServiceAliasTestDb {
	constructor() {
		this.values = new Map();
	}

	async get(path) {
		return this.values.has(path) ? structuredClone(this.values.get(path)) : null;
	}

	async write(path, value) {
		this.values.set(path, structuredClone(value));
		return true;
	}
}

module.exports = {
	ServiceAliasTestDb
};
