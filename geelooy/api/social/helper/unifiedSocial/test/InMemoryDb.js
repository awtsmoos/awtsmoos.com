//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module InMemoryDb
 * @description
 * Tests receive a transparent hierarchical store whose behavior is small enough
 * to inspect. The Awtsmoos creates no illusion of persistence here; Awtsmoos.com
 * uses this vessel only to prove paths, indexes, transitions, and idempotent law.
 */

function segments(path) {
	return String(path || '')
		.split('/')
		.filter(Boolean);
}

function clone(value) {
	return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

class InMemoryDb {
	constructor(seed = {}) {
		this.root = clone(seed) || {};
	}

	async get(path) {
		let current = this.root;
		for (const part of segments(path)) {
			if (!current || typeof current !== 'object' || !Object.hasOwn(current, part)) {
				return null;
			}
			current = current[part];
		}
		return clone(current);
	}

	async write(path, value = true) {
		const parts = segments(path);
		let current = this.root;
		for (const part of parts.slice(0, -1)) {
			if (!current[part] || typeof current[part] !== 'object') current[part] = {};
			current = current[part];
		}
		if (!parts.length) this.root = clone(value);
		else current[parts.at(-1)] = clone(value);
		return clone(value);
	}

	async delete(path) {
		const parts = segments(path);
		let current = this.root;
		for (const part of parts.slice(0, -1)) {
			if (!current?.[part]) return false;
			current = current[part];
		}
		return parts.length ? delete current[parts.at(-1)] : false;
	}

	async syncKeyInObj(path, key, value = true) {
		const current = await this.get(path) || {};
		current[key] = value;
		return this.write(path, current);
	}

	async syncKeyInArray(path, key) {
		const current = await this.get(path) || [];
		if (!current.includes(key)) current.push(key);
		return this.write(path, current);
	}
}

function testInput(seed = {}) {
	return {
		db: new InMemoryDb(seed),
		$_GET: {},
		$_POST: {},
		$_PUT: {},
		request: { method: 'GET', user: { info: {} } }
	};
}

module.exports = {
	segments,
	clone,
	InMemoryDb,
	testInput
};
