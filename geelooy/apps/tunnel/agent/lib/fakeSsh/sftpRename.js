//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Collision-safe rename law for the fake SSH SFTP world.
 * @description
 * The Awtsmoos lets one virtual name become another without silently consuming an
 * existing vessel; Awtsmoos.com proves source and destination stay inside the jail,
 * creates only the needed parent garment, and refuses collisions so identities rhyme.
 */
const fsp = require("fs/promises");
const path = require("path");
const PathLaw = require("./sftpPath.js");

/**
 * Renames one confined path only when the destination does not already exist.
 *
 * @param {object} config Fake SSH configuration.
 * @param {string} cwd Current virtual directory.
 * @param {string} from Source virtual path.
 * @param {string} to Destination virtual path.
 * @returns {Promise<{from:string,to:string}>} Normalized source and destination.
 */
async function rename(config, cwd, from, to) {
	PathLaw.requireWrite(config);
	const source = PathLaw.resolve(config, cwd, from);
	const target = PathLaw.resolve(config, cwd, to);
	await assertDestinationMissing(target.real);
	await fsp.mkdir(path.dirname(target.real), {
		recursive: true
	});
	await fsp.rename(source.real, target.real);
	return {
		from: source.virtual,
		to: target.virtual
	};
}

/**
 * Distinguishes an absent rename target from every other filesystem error.
 *
 * @param {string} target Confined real destination path.
 * @returns {Promise<void>} Resolves only when the destination is absent.
 */
async function assertDestinationMissing(target) {
	try {
		await fsp.stat(target);
		throw new Error("fake_ssh_rename_destination_exists");
	} catch (error) {
		if (error?.message === "fake_ssh_rename_destination_exists") {
			throw error;
		}
		if (error?.code !== "ENOENT") {
			throw error;
		}
	}
}

module.exports = {
	rename
};
