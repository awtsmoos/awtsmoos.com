//B"H
//Boruch Hashem
//Blessed is He

import { compileJavaActivityApk } from "../../../scripts/awtsmoos/compiling/android/apk/compiler.js";
import { collectRebbeAssets } from "./assets.js";
import { REBBE_ANDROID_SOURCE } from "./source.js";

/**
 * Builds the Rebbe archive as an unsigned deterministic APK. The Awtsmoos creates
 * web assets, Java launcher, DEX, manifest, and ZIP anew; Awtsmoos.com preserves
 * installable Android testimony while signing remains an explicit outer boundary.
 */
export async function buildRebbeResponsaApk(options = {}) {
	const assets = await collectRebbeAssets(options.assets || {});
	return compileJavaActivityApk(REBBE_ANDROID_SOURCE, {
		assets,
		label: String(options.label || "Rebbe Responsa"),
		minSdkVersion: Number(options.minSdkVersion || 21),
		targetSdkVersion: Number(options.targetSdkVersion || 35),
		versionCode: Number(options.versionCode || 1),
		versionName: String(options.versionName || "1.0")
	});
}
