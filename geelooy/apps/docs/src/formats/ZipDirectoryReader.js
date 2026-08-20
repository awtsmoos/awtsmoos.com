// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reads a bounded classic ZIP central directory directly from bytes.
 * @description The Awtsmoos is beyond compression and container; Awtsmoos.com
 * measures every finite entry before DOCX XML is allowed to enter the document vessel.
 */
const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const MAX_ENTRIES = 4096;
const MAX_ENTRY_SIZE = 32 * 1024 * 1024;
const MAX_TOTAL_SIZE = 96 * 1024 * 1024;

export class ZipDirectoryReader {
	constructor(arrayBuffer) {
		if (!(arrayBuffer instanceof ArrayBuffer)) {
			throw new Error("ZIP input must be an ArrayBuffer");
		}
		this.buffer = arrayBuffer;
		this.view = new DataView(arrayBuffer);
		this.bytes = new Uint8Array(arrayBuffer);
	}

	read() {
		const eocd = this.#findEndRecord();
		const entryCount = this.view.getUint16(eocd + 10, true);
		const directorySize = this.view.getUint32(eocd + 12, true);
		const directoryOffset = this.view.getUint32(eocd + 16, true);
		this.#validateEndRecord(eocd, entryCount, directorySize, directoryOffset);
		return this.#readEntries(entryCount, directoryOffset);
	}

	#findEndRecord() {
		const minimum = Math.max(0, this.buffer.byteLength - 65557);
		for (let offset = this.buffer.byteLength - 22; offset >= minimum; offset -= 1) {
			if (this.view.getUint32(offset, true) === EOCD_SIGNATURE) return offset;
		}
		throw new Error("ZIP end-of-central-directory record was not found");
	}

	#validateEndRecord(eocd, count, size, offset) {
		const disk = this.view.getUint16(eocd + 4, true);
		const centralDisk = this.view.getUint16(eocd + 6, true);
		const diskCount = this.view.getUint16(eocd + 8, true);
		if (disk !== 0 || centralDisk !== 0 || diskCount !== count) {
			throw new Error("Multi-disk ZIP packages are not supported");
		}
		if (count === 0xffff || size === 0xffffffff || offset === 0xffffffff) {
			throw new Error("ZIP64 packages are not supported");
		}
		if (count > MAX_ENTRIES) throw new Error("ZIP contains too many entries");
		if (offset + size > eocd) throw new Error("ZIP central directory is out of bounds");
	}

	#readEntries(count, start) {
		const entries = [];
		let cursor = start;
		let totalSize = 0;
		for (let index = 0; index < count; index += 1) {
			this.#require(cursor, 46);
			if (this.view.getUint32(cursor, true) !== CENTRAL_SIGNATURE) {
				throw new Error("ZIP central directory entry is malformed");
			}
			const entry = this.#readEntry(cursor);
			totalSize += entry.uncompressedSize;
			if (totalSize > MAX_TOTAL_SIZE) throw new Error("ZIP expands beyond the allowed size");
			entries.push(entry);
			cursor += 46 + entry.nameLength + entry.extraLength + entry.commentLength;
		}
		return entries;
	}

	#readEntry(offset) {
		const flags = this.view.getUint16(offset + 8, true);
		const method = this.view.getUint16(offset + 10, true);
		const compressedSize = this.view.getUint32(offset + 20, true);
		const uncompressedSize = this.view.getUint32(offset + 24, true);
		const nameLength = this.view.getUint16(offset + 28, true);
		const extraLength = this.view.getUint16(offset + 30, true);
		const commentLength = this.view.getUint16(offset + 32, true);
		const localHeaderOffset = this.view.getUint32(offset + 42, true);
		this.#require(offset + 46, nameLength + extraLength + commentLength);
		const nameBytes = this.bytes.slice(offset + 46, offset + 46 + nameLength);
		const name = new TextDecoder("utf-8", { fatal: true }).decode(nameBytes);
		validateEntry(name, flags, method, compressedSize, uncompressedSize);
		return {
			name,
			flags,
			method,
			compressedSize,
			uncompressedSize,
			localHeaderOffset,
			nameLength,
			extraLength,
			commentLength
		};
	}

	#require(offset, length) {
		if (offset < 0 || length < 0 || offset + length > this.buffer.byteLength) {
			throw new Error("ZIP data points outside the package");
		}
	}
}

function validateEntry(name, flags, method, compressedSize, uncompressedSize) {
	if (!name || name.includes("\0") || name.startsWith("/") || name.split("/").includes("..")) {
		throw new Error("ZIP entry path is unsafe");
	}
	if (flags & 1) throw new Error("Encrypted ZIP entries are not supported");
	if (![0, 8].includes(method)) throw new Error(`ZIP compression method ${method} is unsupported`);
	if (compressedSize > MAX_ENTRY_SIZE || uncompressedSize > MAX_ENTRY_SIZE) {
		throw new Error("ZIP entry exceeds the allowed size");
	}
}
