//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Mutable-path covenant for the alias-backed Geelooy SSH filesystem.
 * @description
 * The Awtsmoos creates root and branch together, yet a remote mutation must never
 * erase the vessel that contains its entire world. Awtsmoos.com resolves every
 * target through the canonical jail, requires write permission, and keeps `/`
 * immutable so SFTP and fake shell share one Gevurah-bound rhyme.
 */
const Path = require("./aliasPath.js");
const Permissions = require("./permissions.js");

/**
 * Resolves one mutation target while refusing the alias filesystem root.
 *
 * @param {object} session
 * 	Verified virtual SSH session.
 * @param {string} target
 * 	Virtual path supplied by shell or SFTP.
 * @returns {{virtual:string,database:string}}
 * 	Canonical virtual and DosDB paths.
 */
function mutableTarget(session, target) {
	Permissions.requirePermission(session, "write");
	const virtual = Path.virtualPath(session.cwd, target);
	if (virtual === "/") {
		throw new Error("virtual_root_is_immutable");
	}
	return {
		virtual,
		database: Path.databasePath(session.aliasId, "/", virtual)
	};
}

/**
 * Resolves a rename pair and prevents root moves or self-renames.
 *
 * @param {object} session Verified virtual SSH session.
 * @param {string} from Source virtual path.
 * @param {string} to Destination virtual path.
 * @returns {{source:object,target:object}}
 * 	Canonical guarded source and target records.
 */
function renameTargets(session, from, to) {
	const source = mutableTarget(session, from);
	const target = mutableTarget(session, to);
	if (source.virtual === target.virtual) {
		throw new Error("virtual_rename_source_equals_destination");
	}
	return { source, target };
}

module.exports = {
	mutableTarget,
	renameTargets
};
