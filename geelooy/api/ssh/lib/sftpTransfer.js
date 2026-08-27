//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Bounded whole-file SFTP transfer engine with correct partial-read semantics.
 * @description
 * The Awtsmoos lets a distant file arrive chunk by chunk rather than pretending
 * one packet contains the sea. Awtsmoos.com measures each read and write until
 * the complete byte-vessel stands revealed, beneath the HTTP/base64 gate in rhyme.
 */
const { call } = require("./callbacks.js");

const CHUNK_BYTES = 64 * 1024;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

async function readBuffer(sftp, filePath) {
	const stats = await call(callback => sftp.stat(filePath, callback));
	const size = boundedSize(stats?.size);
	const handle = await call(callback => sftp.open(filePath, "r", callback));
	try {
		const output = Buffer.alloc(size);
		let position = 0;
		while (position < size) {
			const length = Math.min(CHUNK_BYTES, size - position);
			const bytesRead = await readChunk(sftp, handle, output, position, length);
			if (!bytesRead) {
				break;
			}
			position += bytesRead;
		}
		return position === size ? output : output.subarray(0, position);
	} finally {
		await call(callback => sftp.close(handle, callback)).catch(() => {});
	}
}

async function writeBuffer(sftp, filePath, content) {
	const data = Buffer.isBuffer(content) ? content : Buffer.from(content || "");
	boundedSize(data.length);
	const handle = await call(callback => sftp.open(filePath, "w+", callback));
	try {
		let position = 0;
		while (position < data.length) {
			const length = Math.min(CHUNK_BYTES, data.length - position);
			await writeChunk(sftp, handle, data, position, length);
			position += length;
		}
		return { bytes: data.length };
	} finally {
		await call(callback => sftp.close(handle, callback)).catch(() => {});
	}
}

function readChunk(sftp, handle, buffer, offset, length) {
	return new Promise((resolve, reject) => {
		sftp.read(handle, buffer, offset, length, offset, (error, bytesRead) => {
			if (error) {
				reject(error);
				return;
			}
			resolve(Number(bytesRead || 0));
		});
	});
}

function writeChunk(sftp, handle, buffer, offset, length) {
	return new Promise((resolve, reject) => {
		sftp.write(handle, buffer, offset, length, offset, error => {
			if (error) {
				reject(error);
				return;
			}
			resolve();
		});
	});
}

function boundedSize(value) {
	const size = Number(value || 0);
	if (!Number.isSafeInteger(size) || size < 0 || size > MAX_FILE_BYTES) {
		throw new Error(`SSH file exceeds the ${MAX_FILE_BYTES}-byte transfer limit.`);
	}
	return size;
}

module.exports = {
	MAX_FILE_BYTES,
	readBuffer,
	writeBuffer
};
