//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Write-side DosDB operations for one verified alias-backed SSH world.
 * @description
 * The Awtsmoos lets new bytes, folders, removals, and renames emerge through
 * separate measured acts. Awtsmoos.com keeps mutation behind one guarded vessel
 * so shell and SFTP cannot bypass root immutability, collision law, or byte rhyme.
 */
const Budget = require("./aliasFileBudget.js");
const Guard = require("./aliasMutationGuard.js");

class AliasMutations {
	/**
	 * Writes one bounded file value below the immutable alias root.
	 *
	 * @param {object} session Verified virtual SSH session.
	 * @param {string} target Virtual file path.
	 * @param {*} content File value to persist through DosDB.
	 * @returns {Promise<{path:string,bytes:number}>}
	 */
	async writeFile(session, target, content) {
		const resolved = Guard.mutableTarget(session, target);
		const bytes = Budget.requireFileBudget(content);
		await session.db.write(resolved.database, content);
		return {
			path: resolved.virtual,
			bytes
		};
	}

	/**
	 * Creates one directory vessel using the same DosDB call as Geelooy's web API.
	 *
	 * @param {object} session Verified virtual SSH session.
	 * @param {string} target Virtual folder path.
	 * @returns {Promise<{path:string}>}
	 */
	async mkdir(session, target) {
		const resolved = Guard.mutableTarget(session, target);
		await session.db.write(resolved.database);
		return { path: resolved.virtual };
	}

	/**
	 * Removes one already-type-checked path without permitting alias-root deletion.
	 *
	 * @param {object} session Verified virtual SSH session.
	 * @param {string} target Virtual path.
	 * @returns {Promise<{path:string}>}
	 */
	async remove(session, target) {
		const resolved = Guard.mutableTarget(session, target);
		await session.db.delete(resolved.database);
		return { path: resolved.virtual };
	}

	/**
	 * Renames one mutable path while refusing silent destination overwrite.
	 *
	 * @param {object} session Verified virtual SSH session.
	 * @param {string} from Source virtual path.
	 * @param {string} to Destination virtual path.
	 * @returns {Promise<{from:string,to:string}>}
	 */
	async rename(session, from, to) {
		const { source, target } = Guard.renameTargets(session, from, to);
		await assertDestinationFree(session, target.database);
		await session.db.rename(source.database, target.database);
		return {
			from: source.virtual,
			to: target.virtual
		};
	}
}

/**
 * Checks DosDB access metadata without converting ordinary missing paths to errors.
 *
 * @param {object} session Verified virtual SSH session.
 * @param {string} databasePath Canonical destination database path.
 * @returns {Promise<void>}
 */
async function assertDestinationFree(session, databasePath) {
	try {
		const existing = await session.db.read(databasePath, { access: true });
		if (existing) {
			throw new Error("virtual_rename_destination_exists");
		}
	} catch (error) {
		if (error?.message === "virtual_rename_destination_exists") {
			throw error;
		}
		if (!/ENOENT|not.?found|no[_ -]?such/i.test(error?.message || "")) {
			throw error;
		}
	}
}

module.exports = {
	AliasMutations
};
