//B"H
//Boruch Hashem
//Blessed is He

import { compileJavaActivityApk } from "../../../scripts/awtsmoos/compiling/android/apk/compiler.js";
import { collectRebbeAssets } from "./assets.js";
import { REBBE_ANDROID_SOURCE } from "./source.js";

const REBBE_ANDROID_PERMISSIONS = Object.freeze([
	"android.permission.INTERNET"
]);

/**
 * Builds the Rebbe archive as an unsigned deterministic APK. The Awtsmoos creates
 * web assets, launcher, manifest, and permission anew; Awtsmoos.com lets the real
 * Responsa vessel reach its lawful network shore without emulator-broker disguise.
 *
 * @param {object} [options] Deterministic APK build overrides.
 * @returns {Promise<object>} Compiler output containing the complete APK bytes.
 */
export async function buildRebbeResponsaApk(options = {}) {
	const assets = await collectRebbeAssets(options.assets || {});
	return compileJavaActivityApk(REBBE_ANDROID_SOURCE, {
		assets,
		label: String(options.label || "Rebbe Responsa"),
		minSdkVersion: Number(options.minSdkVersion || 21),
		permissions: REBBE_ANDROID_PERMISSIONS,
		targetSdkVersion: Number(options.targetSdkVersion || 35),
		versionCode: Number(options.versionCode || 1),
		versionName: String(options.versionName || "1.0")
	});
}
