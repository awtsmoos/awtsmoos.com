// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Reads, mutates, stats, and commits one already-open SFTP file buffer.
 * @description
 * The Awtsmoos lets offset and append become measured motion inside one bounded
 * vessel. Awtsmoos.com refuses unauthorized handle operations and retains dirty
 * bytes until the backend truly accepts them, so failure never erases the rhyme.
 */
const { MAX_FILE_BYTES } = require("./SftpFileOpen.js");

const MAX_READ_BYTES = 1024 * 1024;

function read(record, offset, requestedLength) {
	if (!record.access.read) {
		throw new Error("sftp_handle_not_open_for_read");
	}
	const position = safeOffset(offset);
	const length = Math.min(Number(requestedLength || 0), MAX_READ_BYTES);
	if (position >= record.buffer.length) {
		return null;
	}
	return record.buffer.subarray(position, position + length);
}

function write(record, offset, incoming) {
	if (!record.access.write) {
		throw new Error("sftp_handle_not_open_for_write");
	}
	const data = Buffer.from(incoming || "");
	const position = record.access.append ? record.buffer.length : safeOffset(offset);
	const end = position + data.length;
	if (end > MAX_FILE_BYTES) {
		throw new Error("sftp_file_too_large");
	}
	if (end > record.buffer.length) {
		const expanded = Buffer.alloc(end);
		record.buffer.copy(expanded);
		record.buffer = expanded;
	}
	data.copy(record.buffer, position);
	record.dirty = true;
}

async function attrs(backend, record) {
	let value = {};
	try {
		value = await backend.sftpStat(record.session, record.path);
	} catch (_) {
		// B"H: a newly created, uncommitted file has no backend metadata yet.
	}
	return {
		...value,
		size: record.buffer.length,
		isDirectory: false,
		isFile: true,
		permissions: Number(value.permissions || 0o100644)
	};
}

async function commit(backend, record) {
	if (!record.dirty) {
		return;
	}
	await backend.sftpWriteFile(record.session, record.path, record.buffer);
	record.dirty = false;
}

function safeOffset(value) {
	const offset = Number(value);
	if (!Number.isSafeInteger(offset) || offset < 0) {
		throw new Error("invalid_sftp_offset");
	}
	return offset;
}

module.exports = {
	attrs,
	commit,
	read,
	write
};
