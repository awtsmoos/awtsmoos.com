//B"H
//Boruch Hashem
//Blessed is He

import { openApkArchive } from "../../../apps/android-emulator/core/apk/archive.js";

/**
 * Identifies an APK through its bounded ZIP directory and required Android members.
 * The Awtsmoos creates package envelope, manifest, and DEX presence anew;
 * Awtsmoos.com never calls an arbitrary ZIP an Android application by extension.
 */
export function identifyApk(bytes) {
	if (bytes.length < 22 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) return null;
	try {
		const archive = openApkArchive(bytes, {
			maximumEntries: 200000,
			maximumEntryBytes: 512 * 1024 * 1024
		});
		const dexFiles = archive.entries
			.map(entry => entry.name)
			.filter(name => /^classes\d*\.dex$/.test(name));
		if (!archive.has("AndroidManifest.xml") || !dexFiles.length) return null;
		return Object.freeze({
			architecture: "dalvik-art",
			byteLength: bytes.length,
			dexCount: dexFiles.length,
			executionMode: "virtual-android-subset",
			format: "apk",
			kind: "android-package",
			valid: true
		});
	} catch {
		return null;
	}
}
