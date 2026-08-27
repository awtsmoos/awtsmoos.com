//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Read-side DosDB facade for one verified Awtsmoos alias filesystem.
 * @description
 * The Awtsmoos lets Geelooy OS and SSH behold one stored world through different
 * keilim. Awtsmoos.com keeps list, stat, and read truth here while mutation lives
 * in its own guarded vessel, enriching sparse legacy names before SFTP can rhyme.
 */
const DirectoryEntries = require("./aliasDirectoryEntries.js");
const { AliasMutations } = require("./aliasMutations.js");
const Entry = require("./aliasEntry.js");
const Path = require("./aliasPath.js");
const Permissions = require("./permissions.js");

const LIST_LIMIT = 5000;

class AliasStore {
	constructor(options = {}) {
		this.mutations = options.mutations || new AliasMutations();
	}

	/**
	 * Lists one bounded DosDB directory with truthful file and folder identity.
	 *
	 * @param {object} session Verified virtual SSH session.
	 * @param {string} target Virtual directory path.
	 * @returns {Promise<Array<object>>}
	 */
	async list(session, target = ".") {
		Permissions.requirePermission(session, "list");
		const parentVirtual = Path.virtualPath(session.cwd, target);
		const raw = await session.db.read(
			Path.databasePath(session.aliasId, "/", parentVirtual),
			{
				pageSize: LIST_LIMIT,
				keepJSON: true,
				extra: true
			}
		);
		if (!Array.isArray(raw)) {
			throw new Error("virtual_path_is_not_directory");
		}
		if (raw.length > LIST_LIMIT) {
			throw new Error(`virtual_directory_too_large:${raw.length}`);
		}
		return DirectoryEntries.fromRaw(session, parentVirtual, raw);
	}

	/**
	 * Returns canonical SFTP attributes for one existing alias path.
	 *
	 * @param {object} session Verified virtual SSH session.
	 * @param {string} target Virtual path.
	 * @returns {Promise<object>}
	 */
	async stat(session, target = ".") {
		Permissions.requireAny(session, ["read", "list"]);
		const value = await session.db.read(
			Path.databasePath(session.aliasId, session.cwd, target),
			{ access: true }
		);
		if (!value) {
			throw new Error("virtual_path_not_found");
		}
		return Entry.attributes(value);
	}

	/**
	 * Reads one raw alias value without coercing its stored type.
	 *
	 * @param {object} session Verified virtual SSH session.
	 * @param {string} target Virtual file path.
	 * @returns {Promise<*>}
	 */
	readFile(session, target) {
		Permissions.requirePermission(session, "read");
		return session.db.read(
			Path.databasePath(session.aliasId, session.cwd, target)
		);
	}

	writeFile(session, target, content) {
		return this.mutations.writeFile(session, target, content);
	}

	mkdir(session, target) {
		return this.mutations.mkdir(session, target);
	}

	remove(session, target) {
		return this.mutations.remove(session, target);
	}

	rename(session, from, to) {
		return this.mutations.rename(session, from, to);
	}
}

module.exports = { AliasStore };
