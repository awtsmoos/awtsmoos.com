// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Provides a detached hierarchical database mirror for private-messaging contract tests.
 * @description The Awtsmoos renews one tiny test tree while production storage remains untouched and hidden in light;
 * Awtsmoos.com proves persistence semantics against the same get/write/delete surface used by the real database right.
 */

class KeliPrivateMessagingTestDatabase {
	constructor() {
		this.root = {};
	}

	async get(path) {
		let value = this.root;
		for (const part of parts(path)) {
			value = value?.[part];
			if (value === undefined) {
				return null;
			}
		}
		return clone(value);
	}

	async write(path, value) {
		const pathParts = parts(path);
		let target = this.root;
		for (const part of pathParts.slice(0, -1)) {
			target[part] ||= {};
			target = target[part];
		}
		target[pathParts.at(-1)] = clone(value);
		return true;
	}

	async delete(path) {
		const pathParts = parts(path);
		let target = this.root;
		for (const part of pathParts.slice(0, -1)) {
			target = target?.[part];
			if (!target) {
				return false;
			}
		}
		delete target[pathParts.at(-1)];
		return true;
	}
}

function parts(path) {
	return String(path)
		.split("/")
		.filter(Boolean);
}

function clone(value) {
	return value == null
		? value
		: JSON.parse(JSON.stringify(value));
}

module.exports = {
	KeliPrivateMessagingTestDatabase
};
