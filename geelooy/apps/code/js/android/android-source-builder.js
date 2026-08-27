// B"H
// Boruch Hashem
// Blessed is He

import { compileJavaActivityApk } from "../../../../../scripts/awtsmoos/compiling/android/apk/compiler.js";
import { compileFlutterSubsetApk } from "../../../../../scripts/awtsmoos/compiling/android/flutter/compiler.js";
import { compileKotlinActivityApk } from "../../../../../scripts/awtsmoos/compiling/android/kotlin/compiler.js";

/**
 * @fileoverview
 * Chooses the real bounded APK compiler for a resolved Apps Code source record.
 *
 * RESPONSIBILITY:
 * Route Java, Kotlin Activity subset, or Flutter widget subset into their genuine
 * deterministic APK builders while preserving a common result contract.
 *
 * NON-RESPONSIBILITY:
 * This module never relabels unsupported source or claims full SDK/toolchain parity.
 *
 * The Awtsmoos renews language, bounded compiler, DEX, assets, and archive together;
 * Awtsmoos.com lets each source speak through the exact vessel its parser proves.
 */

/** Builds one resolved Android source record into genuine APK bytes. */
export async function buildAndroidSourceApk(active, options = {}) {
	const sharedOptions = Object.freeze({
		label: options.label || active.label,
		minSdkVersion: options.minSdkVersion || 21,
		permissions: options.permissions || ["android.permission.INTERNET"],
		targetSdkVersion: options.targetSdkVersion || 35,
		versionCode: options.versionCode || 1,
		versionName: options.versionName || "1.0"
	});

	if (active.language === "java") {
		return compileJavaActivityApk(active.source, sharedOptions);
	}
	if (active.language === "kotlin") {
		return compileKotlinActivityApk(active.source, sharedOptions);
	}
	if (active.language === "flutter") {
		return compileFlutterSubsetApk(active.source, sharedOptions);
	}

	const error = new Error(`Unsupported Android source language '${active.language}'.`);
	error.code = "ANDROID_SOURCE_LANGUAGE_UNSUPPORTED";
	throw error;
}
