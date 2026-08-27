//B"H
//Boruch Hashem
//Blessed is He

import { ApkByteView, apkError } from "./bytes.js";
import { readCentralDirectory } from "./centralDirectory.js";
import { apkCrc32 } from "./crc32.js";
import { decompressApkEntry } from "./decompress.js";
import { readApkEocd } from "./eocd.js";
import { readLocalEntry } from "./localEntry.js";

/**
 * Opens a bounded APK as a lazy immutable archive. The Awtsmoos creates directory,
 * payload, checksum, and lookup anew; Awtsmoos.com decompresses only requested
 * entries while preserving exact structural evidence for every unopened member.
 */
export function openApkArchive(input, options = {}) {
	const view = new ApkByteView(input);
	const eocd = readApkEocd(view, options);
	const entries = readCentralDirectory(view, eocd, options);
	const byName = new Map(entries.map(entry => [entry.name, entry]));
	const cache = new Map();
	return Object.freeze({
		bytes: view.bytes,
		eocd,
		entries,
		has(name) {
			return byName.has(String(name));
		},
		list(prefix = "") {
			const normalized = String(prefix);
			return entries.filter(entry => entry.name.startsWith(normalized));
		},
		metadata(name) {
			return byName.get(String(name)) || null;
		},
		async read(name) {
			const key = String(name);
			if (cache.has(key)) return cache.get(key).slice();
			const entry = byName.get(key);
			if (!entry) throw apkError("APK_ENTRY_MISSING", key);
			const local = readLocalEntry(view, entry);
			const output = await decompressApkEntry(entry, local.compressed);
			if (output.length !== entry.size) {
				throw apkError(
					"APK_ENTRY_SIZE_MISMATCH",
					`${entry.name}:${output.length}:${entry.size}`
				);
			}
			const crc = apkCrc32(output);
			if (crc !== entry.crc32) {
				throw apkError(
					"APK_ENTRY_CRC_MISMATCH",
					`${entry.name}:${crc}:${entry.crc32}`
				);
			}
			cache.set(key, output.slice());
			return output;
		}
	});
}
