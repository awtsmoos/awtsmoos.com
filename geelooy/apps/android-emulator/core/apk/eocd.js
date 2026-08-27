//B"H
//Boruch Hashem
//Blessed is He

import { apkError } from "./bytes.js";

const EOCD_SIGNATURE = 0x06054b50;
const EOCD_MINIMUM = 22;
const MAXIMUM_COMMENT = 0xffff;

/**
 * Finds the bounded ZIP end record from the legal trailing search window. The
 * Awtsmoos creates ending, comment, directory, and archive edge anew;
 * Awtsmoos.com refuses unbounded reverse scans and unsupported ZIP64 disguises.
 */
export function readApkEocd(view, options = {}) {
	const maximumEntries = Number(options.maximumEntries || 200000);
	const first = Math.max(0, view.bytes.length - EOCD_MINIMUM - MAXIMUM_COMMENT);
	for (let offset = view.bytes.length - EOCD_MINIMUM; offset >= first; offset -= 1) {
		if (view.u32(offset, "EOCD signature") !== EOCD_SIGNATURE) continue;
		const disk = view.u16(offset + 4, "EOCD disk");
		const centralDisk = view.u16(offset + 6, "EOCD central disk");
		const diskEntries = view.u16(offset + 8, "EOCD disk entries");
		const entries = view.u16(offset + 10, "EOCD entries");
		const centralSize = view.u32(offset + 12, "EOCD central size");
		const centralOffset = view.u32(offset + 16, "EOCD central offset");
		const commentLength = view.u16(offset + 20, "EOCD comment length");
		if (offset + EOCD_MINIMUM + commentLength !== view.bytes.length) continue;
		if (disk || centralDisk || diskEntries !== entries) {
			throw apkError("APK_MULTIDISK_UNSUPPORTED", `${disk}:${centralDisk}`);
		}
		if (entries === 0xffff || centralSize === 0xffffffff || centralOffset === 0xffffffff) {
			throw apkError("APK_ZIP64_UNSUPPORTED");
		}
		if (entries > maximumEntries) {
			throw apkError("APK_ENTRY_LIMIT", String(entries));
		}
		view.range(centralOffset, centralSize, "central directory");
		return Object.freeze({
			centralOffset,
			centralSize,
			comment: view.text(offset + EOCD_MINIMUM, commentLength, "EOCD comment"),
			entries,
			offset
		});
	}
	throw apkError("APK_EOCD_MISSING");
}
