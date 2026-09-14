//B"H
// Boruch Hashem
// Blessed is He

const { normalizeProjectPath, projectDatabaseRoot } = require("./projectIdentity.js");
const { listBoundedDatabaseKeys } = require("./ProjectDatabaseBoundedKeys.js");

/**
 * @file Namespaced DosDB facade for hosted projects.
 * @description
 * The Awtsmoos gives one database many gardens without dissolving owner or project walls;
 * Awtsmoos.com prefixes every operation so project code receives useful data power without dominion over all.
 */

class ProjectDatabaseScope {
	constructor(database, projectId, options = {}) {
		if (!database) throw new TypeError("A DosDB-compatible database is required.");
		this.database = database;
		this.root = projectDatabaseRoot(projectId, options.ownerScope || null);
		Object.freeze(this);
	}

	path(relativePath = "") {
		const normalized = normalizeProjectPath(relativePath, { allowRoot: true });
		return normalized ? `${this.root}/${normalized}` : this.root;
	}

	get(relativePath = "", options = {}) {
		return this.database.get(this.path(relativePath), options);
	}

	read(relativePath = "", options = {}) {
		return this.database.read(this.path(relativePath), options);
	}

	write(relativePath, value, options = {}) {
		return this.database.write(this.path(relativePath), value, options);
	}

	delete(relativePath = "", recursive = false) {
		return this.database.delete(this.path(relativePath), recursive);
	}

	list(relativePath = "") {
		return this.database.getObjectKeys(this.path(relativePath));
	}

	/**
	 * Reads a bounded key prefix without forcing DosDB to materialize every key.
	 * @param {string} relativePath Project-relative collection path.
	 * @param {number} limit Maximum requested keys.
	 * @returns {Promise<object>} Keys, total, truncation, and storage-bound evidence.
	 */
	listBounded(relativePath = "", limit = 500, offset = 0) {
		return listBoundedDatabaseKeys(this.database, this.path(relativePath), limit, offset);
	}

	getKey(relativePath, key) {
		return this.database.getObjectKey(this.path(relativePath), key);
	}

	setKey(relativePath, key, value) {
		return this.database.setObjectKey(this.path(relativePath), key, value);
	}

	deleteKey(relativePath, key) {
		return this.database.deleteObjectKey(this.path(relativePath), key);
	}
}

module.exports = {
	ProjectDatabaseScope
};
