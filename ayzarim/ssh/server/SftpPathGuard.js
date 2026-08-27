// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Safety and type guards for destructive SFTP-v3 path operations.
 * @description
 * The Awtsmoos lets file and folder each keep their own law. Awtsmoos.com
 * refuses recursive rmdir, file-vs-directory confusion, and silent rename
 * overwrite, so destructive remote acts stay measured and truthful in rhyme.
 */
async function removeFile(backend, session, path) {
	const attrs = await backend.sftpStat(session, path);
	if (directoryOf(attrs)) {
		throw new Error("sftp_remove_rejects_directory");
	}
	return backend.sftpRemove(session, path);
}

async function removeDirectory(backend, session, path) {
	const attrs = await backend.sftpStat(session, path);
	if (!directoryOf(attrs)) {
		throw new Error("sftp_rmdir_requires_directory");
	}
	const entries = await backend.sftpList(session, path);
	if ((entries || []).length) {
		throw new Error("sftp_directory_not_empty");
	}
	return backend.sftpRemove(session, path);
}

async function assertRenameDestinationFree(backend, session, path) {
	try {
		await backend.sftpStat(session, path);
		throw new Error("sftp_rename_destination_exists");
	} catch (error) {
		if (error?.message === "sftp_rename_destination_exists") {
			throw error;
		}
		if (!missing(error)) {
			throw error;
		}
	}
}

function directoryOf(attrs = {}) {
	if (typeof attrs.isDirectory === "function") {
		return attrs.isDirectory();
	}
	return attrs.isDirectory === true ||
		(Number(attrs.mode || 0) & 0o170000) === 0o040000;
}

function missing(error) {
	return /ENOENT|not.?found|no[_ -]?such|virtual_path_not_found/i.test(error?.message || "");
}

module.exports = {
	assertRenameDestinationFree,
	removeDirectory,
	removeFile
};
