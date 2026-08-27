// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file SFTP-v3 path and directory operations over a guarded virtual backend.
 * @description
 * The Awtsmoos lets names become folders, stats, and moves without confusing
 * destructive laws. Awtsmoos.com keeps REMOVE, RMDIR, REALPATH, and RENAME
 * explicit so every remote path action passes through its rightful keli in rhyme.
 */
const Guard = require("./SftpPathGuard.js");
const Wire = require("./SftpWire.js");

const MAX_DIRECTORY_ENTRIES = 5000;
const DIRECTORY_BATCH = 128;

class SftpPathOps {
	constructor(backend, handles) {
		this.backend = backend;
		this.handles = handles;
	}

	async stat(id, stream, session) {
		const path = stream.readString("utf8");
		return Wire.attrs(id, await this.backend.sftpStat(session, path));
	}

	async opendir(id, stream, session) {
		const path = stream.readString("utf8");
		const entries = await this.backend.sftpList(session, path);
		if (entries.length > MAX_DIRECTORY_ENTRIES) {
			throw new Error("sftp_directory_too_large");
		}
		const reply = Wire.handle(id);
		this.handles.add(reply.token, {
			type: "directory",
			path,
			entries,
			index: 0,
			session
		});
		return reply.packet;
	}

	async readdir(id, stream) {
		const record = this.handles.get(stream.readString("utf8"));
		if (record.type !== "directory") {
			throw new Error("sftp_handle_not_directory");
		}
		if (record.index >= record.entries.length) {
			return Wire.status(id, Wire.STATUS.EOF, "EOF");
		}
		const entries = record.entries.slice(record.index, record.index + DIRECTORY_BATCH);
		record.index += entries.length;
		return Wire.name(id, entries);
	}

	async removeFile(id, stream, session) {
		await Guard.removeFile(this.backend, session, stream.readString("utf8"));
		return Wire.status(id, Wire.STATUS.OK, "removed");
	}

	async rmdir(id, stream, session) {
		await Guard.removeDirectory(this.backend, session, stream.readString("utf8"));
		return Wire.status(id, Wire.STATUS.OK, "removed directory");
	}

	async mkdir(id, stream, session) {
		await this.backend.sftpMkdir(session, stream.readString("utf8"));
		return Wire.status(id, Wire.STATUS.OK, "created");
	}

	async realpath(id, stream, session) {
		const requested = stream.readString("utf8") || ".";
		const path = this.backend.sftpRealpath
			? await this.backend.sftpRealpath(session, requested)
			: requested;
		const attrs = await safeStat(this.backend, session, path);
		return Wire.name(id, [{ filename: path, longname: path, attrs }]);
	}

	async rename(id, stream, session) {
		if (typeof this.backend.sftpRename !== "function") {
			return Wire.status(id, Wire.STATUS.OP_UNSUPPORTED, "rename unsupported");
		}
		const from = stream.readString("utf8");
		const to = stream.readString("utf8");
		await Guard.assertRenameDestinationFree(this.backend, session, to);
		await this.backend.sftpRename(session, from, to);
		return Wire.status(id, Wire.STATUS.OK, "renamed");
	}
}

async function safeStat(backend, session, path) {
	try {
		return await backend.sftpStat(session, path);
	} catch (_) {
		return {};
	}
}

module.exports = { SftpPathOps };
