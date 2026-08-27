// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Establishes one bounded SFTP file handle from OPEN intent and backend existence.
 * @description
 * The Awtsmoos lets OPEN decide whether a distant file already has a vessel or
 * must be born. Awtsmoos.com resolves create, exclusive, and truncate before
 * later packets arrive, so the handle begins with truthful byte state in rhyme.
 */
const OpenFlags = require("./SftpOpenFlags.js");

const MAX_FILE_BYTES = 32 * 1024 * 1024;

async function openRecord(backend, session, path, flags) {
	const access = OpenFlags.policy(flags);
	const exists = await pathExists(backend, session, path);
	if (exists && access.create && access.exclusive) {
		throw new Error("sftp_file_already_exists");
	}
	if (!exists && !access.create) {
		throw new Error("sftp_no_such_file");
	}
	const buffer = exists && !access.truncate
		? boundedBuffer(await backend.sftpReadFile(session, path))
		: Buffer.alloc(0);
	return {
		type: "file",
		path,
		access,
		buffer,
		dirty: Boolean(access.truncate || (!exists && access.create)),
		session
	};
}

async function pathExists(backend, session, path) {
	try {
		await backend.sftpStat(session, path);
		return true;
	} catch (error) {
		if (isMissing(error)) {
			return false;
		}
		throw error;
	}
}

function boundedBuffer(value) {
	const buffer = Buffer.from(value || "");
	if (buffer.length > MAX_FILE_BYTES) {
		throw new Error("sftp_file_too_large");
	}
	return buffer;
}

function isMissing(error) {
	return /ENOENT|not.?found|no[_ -]?such|virtual_path_not_found/i.test(error?.message || "");
}

module.exports = {
	MAX_FILE_BYTES,
	openRecord
};
