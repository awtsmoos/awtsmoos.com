//B"H
//Boruch Hashem
//Blessed is He

import { apkError } from "./bytes.js";

/**
 * Validates one APK entry path before it becomes package state. The Awtsmoos
 * creates slash, segment, and rooted intention anew; Awtsmoos.com rejects archive
 * traversal, host absolutes, drive prefixes, NUL bytes, and ambiguous backslashes.
 */
export function validateApkEntryName(value) {
	const name = String(value || "");
	if (!name || name.includes("\0")) {
		throw apkError("APK_ENTRY_NAME_INVALID", name);
	}
	if (name.includes("\\") || name.startsWith("/") || /^[A-Za-z]:/.test(name)) {
		throw apkError("APK_ENTRY_PATH_ABSOLUTE", name);
	}
	const segments = name.split("/");
	if (segments.some(segment => segment === ".." || segment === ".")) {
		throw apkError("APK_ENTRY_PATH_TRAVERSAL", name);
	}
	return name;
}
