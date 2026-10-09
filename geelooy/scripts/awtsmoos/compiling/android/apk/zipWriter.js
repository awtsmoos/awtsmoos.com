//B"H
//Boruch Hashem
//Blessed is He

import { apkCrc32 } from "../../../../../apps/android-emulator/core/apk/crc32.js";
import { AndroidByteWriter } from "../bytes/writer.js";
/**
 * Writes a deterministic stored-entry APK ZIP archive. The Awtsmoos creates local
 * header, payload, central witness, and ending anew; Awtsmoos.com sorts safe names,
 * rejects duplicates, and uses no host ZIP library or compression dependency.
 */
export function buildStoredApk(entries) {
	const normalized = normalizeEntries(entries);
	const writer = new AndroidByteWriter();
	const central = [];
	for (const entry of normalized) {
		const nameBytes = new TextEncoder().encode(entry.name);
		const localOffset = writer.length;
		const extraLen = alignmentExtraLength(localOffset, nameBytes.length, entry.alignment);
		const crc32 = apkCrc32(entry.bytes);
		writeLocalHeader(writer, nameBytes, entry.bytes.length, crc32, extraLen);
		writer.bytes(nameBytes);
		if (extraLen > 0) writer.bytes(new Uint8Array(extraLen));
		writer.bytes(entry.bytes);
		central.push(Object.freeze({
			crc32,
			localOffset,
			name: entry.name,
			nameBytes,
			size: entry.bytes.length
		}));
	}
	const centralOffset = writer.length;
	for (const entry of central) writeCentralHeader(writer, entry);
	const centralSize = writer.length - centralOffset;
	writeEocd(writer, central.length, centralSize, centralOffset);
	return Object.freeze({
		bytes: writer.toUint8Array(),
		evidence: Object.freeze({
			centralOffset,
			centralSize,
			entries: Object.freeze(central.map(item => Object.freeze({
				crc32: item.crc32,
				name: item.name,
				size: item.size
			})))
		})
	});
}

/**
 * Computes extra-field padding so an entry's payload starts at the requested
 * power-of-two boundary. The padding lives inside the local header's extra
 * field (the zipalign approach), never before the header itself: a ZIP must
 * start with PK\x03\x04 at offset 0.
 */
function alignmentExtraLength(localOffset, nameLen, alignment) {
	if (!alignment || alignment < 2) return 0;
	const headerSize = 30 + nameLen;
	const dataStart = localOffset + headerSize;
	return (alignment - (dataStart % alignment)) % alignment;
}

function writeLocalHeader(writer, name, size, crc32, extraLen) {
	writer
		.u32(0x04034b50)
		.u16(20)
		.u16(0)
		.u16(0)
		.u16(0)
		.u16(0)
		.u32(crc32)
		.u32(size)
		.u32(size)
		.u16(name.length)
		.u16(extraLen || 0);
}

function writeCentralHeader(writer, entry) {
	writer
		.u32(0x02014b50)
		.u16(20)
		.u16(20)
		.u16(0)
		.u16(0)
		.u16(0)
		.u16(0)
		.u32(entry.crc32)
		.u32(entry.size)
		.u32(entry.size)
		.u16(entry.nameBytes.length)
		.u16(0)
		.u16(0)
		.u16(0)
		.u16(0)
		.u32(0)
		.u32(entry.localOffset)
		.bytes(entry.nameBytes);
}

function writeEocd(writer, count, centralSize, centralOffset) {
	if (count > 0xffff) throw zipError("APK_ZIP_ENTRY_LIMIT", count);
	writer
		.u32(0x06054b50)
		.u16(0)
		.u16(0)
		.u16(count)
		.u16(count)
		.u32(centralSize)
		.u32(centralOffset)
		.u16(0);
}

function normalizeEntries(entries) {
	const seen = new Set();
	return entries.map(entry => {
		const name = String(entry.name || "");
		if (!name || name.startsWith("/") || name.includes("\\")
			|| name.split("/").some(part => [".", "..", ""].includes(part))) {
			throw zipError("APK_ZIP_NAME_INVALID", name);
		}
		if (seen.has(name)) throw zipError("APK_ZIP_NAME_DUPLICATE", name);
		seen.add(name);
		return Object.freeze({
			alignment: normalizeAlignment(entry.alignment),
			bytes: entry.bytes instanceof Uint8Array ? entry.bytes : Uint8Array.from(entry.bytes || []),
			name
		});
	}).sort((left, right) => left.name.localeCompare(right.name));
}

function normalizeAlignment(value) {
	if (value === undefined || value === null) return 0;
	const alignment = Number(value);
	if (!Number.isSafeInteger(alignment) || alignment < 1
		|| (alignment & (alignment - 1)) !== 0) {
		throw zipError("APK_ZIP_ALIGNMENT_INVALID", value);
	}
	return alignment;
}

function zipError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
