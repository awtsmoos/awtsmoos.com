//B"H
//Boruch Hashem
//Blessed is He

import { apkError } from "./bytes.js";
import { validateApkEntryName } from "./path.js";

const CENTRAL_SIGNATURE = 0x02014b50;
const CENTRAL_FIXED = 46;

/**
 * Reads the complete bounded ZIP central directory. The Awtsmoos creates entry,
 * method, size, CRC, and local doorway anew; Awtsmoos.com rejects duplicates,
 * encrypted content, unsupported compression, and mismatched directory counts.
 */
export function readCentralDirectory(view, eocd, options = {}) {
	const maximumEntryBytes = Number(options.maximumEntryBytes || 512 * 1024 * 1024);
	const entries = [];
	const names = new Set();
	let offset = eocd.centralOffset;
	const end = eocd.centralOffset + eocd.centralSize;
	while (offset < end) {
		view.range(offset, CENTRAL_FIXED, "central entry");
		if (view.u32(offset, "central signature") !== CENTRAL_SIGNATURE) {
			throw apkError("APK_CENTRAL_SIGNATURE", String(offset));
		}
		const flags = view.u16(offset + 8, "central flags");
		const method = view.u16(offset + 10, "central method");
		const crc32 = view.u32(offset + 16, "central CRC32");
		const compressedSize = view.u32(offset + 20, "central compressed size");
		const size = view.u32(offset + 24, "central size");
		const nameLength = view.u16(offset + 28, "central name length");
		const extraLength = view.u16(offset + 30, "central extra length");
		const commentLength = view.u16(offset + 32, "central comment length");
		const localOffset = view.u32(offset + 42, "central local offset");
		const total = CENTRAL_FIXED + nameLength + extraLength + commentLength;
		view.range(offset, total, "central entry body");
		const name = validateApkEntryName(
			view.text(offset + CENTRAL_FIXED, nameLength, "central name")
		);
		validateEntry(name, flags, method, compressedSize, size, maximumEntryBytes, names);
		entries.push(Object.freeze({
			comment: view.text(
				offset + CENTRAL_FIXED + nameLength + extraLength,
				commentLength,
				"central comment"
			),
			compressedSize,
			crc32,
			flags,
			localOffset,
			method,
			name,
			size
		}));
		offset += total;
	}
	if (offset !== end || entries.length !== eocd.entries) {
		throw apkError("APK_CENTRAL_COUNT", `${entries.length}:${eocd.entries}`);
	}
	return Object.freeze(entries);
}

function validateEntry(name, flags, method, compressedSize, size, maximum, names) {
	if (names.has(name)) throw apkError("APK_ENTRY_DUPLICATE", name);
	names.add(name);
	if (flags & 1) throw apkError("APK_ENCRYPTION_UNSUPPORTED", name);
	if (![0, 8].includes(method)) throw apkError("APK_COMPRESSION_UNSUPPORTED", `${name}:${method}`);
	if (size > maximum || compressedSize > maximum) {
		throw apkError("APK_ENTRY_SIZE_LIMIT", `${name}:${size}:${compressedSize}`);
	}
}
