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
		const localOffset = writer.length;
		const nameBytes = new TextEncoder().encode(entry.name);
		const crc32 = apkCrc32(entry.bytes);
		writeLocalHeader(writer, nameBytes, entry.bytes.length, crc32);
		writer.bytes(nameBytes).bytes(entry.bytes);
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

function writeLocalHeader(writer, name, size, crc32) {
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
		.u16(0);
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
			bytes: entry.bytes instanceof Uint8Array ? entry.bytes : Uint8Array.from(entry.bytes || []),
			name
		});
	}).sort((left, right) => left.name.localeCompare(right.name));
}

function zipError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
