//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Thin SFTP-v3 file-handle verbs over validated open state and bounded buffers.
 * @description
 * The Awtsmoos lets OPEN establish a covenant, then READ, WRITE, FSTAT, and CLOSE
 * merely fulfill it. Awtsmoos.com also flushes dirty handles during teardown, so
 * a closing channel does not forget already-acknowledged remote bytes in rhyme.
 */
const BufferState = require("./SftpFileBuffer.js");
const FileOpen = require("./SftpFileOpen.js");
const Wire = require("./SftpWire.js");

class SftpFileOps {
	constructor(backend, handles) {
		this.backend = backend;
		this.handles = handles;
	}

	async open(id, stream, session) {
		const path = stream.readString("utf8");
		const flags = stream.readUInt32BE() || 0;
		const record = await FileOpen.openRecord(this.backend, session, path, flags);
		const reply = Wire.handle(id);
		this.handles.add(reply.token, record);
		return reply.packet;
	}

	async read(id, stream) {
		const record = this.file(stream.readString("utf8"));
		const offset = readOffset(stream);
		const requested = stream.readUInt32BE() || 0;
		const chunk = BufferState.read(record, offset, requested);
		return chunk === null
			? Wire.status(id, Wire.STATUS.EOF, "EOF")
			: Wire.data(id, chunk);
	}

	async write(id, stream) {
		const record = this.file(stream.readString("utf8"));
		const offset = readOffset(stream);
		const incoming = stream.readString(null) || Buffer.alloc(0);
		BufferState.write(record, offset, incoming);
		return Wire.status(id, Wire.STATUS.OK, "written");
	}

	async close(id, stream) {
		const token = stream.readString("utf8");
		const record = this.handles.get(token);
		if (record.type === "file") {
			await BufferState.commit(this.backend, record);
		}
		this.handles.remove(token);
		return Wire.status(id, Wire.STATUS.OK, "closed");
	}

	async fstat(id, stream) {
		const record = this.file(stream.readString("utf8"));
		return Wire.attrs(id, await BufferState.attrs(this.backend, record));
	}

	async flushAll() {
		const files = this.handles.values()
			.filter(record => record.type === "file");
		for (const record of files) {
			await BufferState.commit(this.backend, record);
		}
	}

	file(token) {
		const record = this.handles.get(token);
		if (record.type !== "file") {
			throw new Error("sftp_handle_not_file");
		}
		return record;
	}
}

function readOffset(stream) {
	const bytes = stream.readBytes(8);
	if (!bytes) {
		throw new Error("missing_sftp_offset");
	}
	const value = bytes.readBigUInt64BE(0);
	if (value > BigInt(Number.MAX_SAFE_INTEGER)) {
		throw new Error("sftp_offset_too_large");
	}
	return Number(value);
}

module.exports = { SftpFileOps };
