//B"H
//Boruch Hashem
//Blessed is He

import { buildActivityManifest } from "../axml/manifest.js";
import { getOrCreateSigningKey, signApkEntries } from "./signer.js";

/**
 * Assembles a signed native-activity APK with pure Awtsmoos JavaScript: binary
 * manifest, page-aligned native libraries, assets, v1 JAR signatures, and the
 * v2 APK Signing Block. No aapt, no apksigner, no keytool in this path.
 *
 * options:
 *   packageName, label, className (manifest placeholder), versionCode,
 *   versionName, minSdkVersion, targetSdkVersion,
 *   nativeActivity: { libName, configChanges },
 *   nativeLibs: { "<abi>": { "lib<name>.so": Uint8Array } },
 *   assets: { "<path>": Uint8Array },
 *   keyDir, schemes: { v1, v2 }
 */
export function compileNativeAppApk(options = {}) {
	const specification = Object.freeze({
		className: String(options.className || "MerkavaApp"),
		label: String(options.label || "MerkavaApp"),
		minSdkVersion: Number(options.minSdkVersion || 26),
		nativeActivity: normalizeNativeActivity(options.nativeActivity),
		packageName: validatePackageName(options.packageName),
		permissions: Object.freeze([]),
		targetSdkVersion: Number(options.targetSdkVersion || 35),
		versionCode: Number(options.versionCode || 1),
		versionName: String(options.versionName || "1.0")
	});
	const manifest = buildActivityManifest(specification);
	const entries = [
		Object.freeze({ alignment: 4, bytes: manifest.bytes, name: "AndroidManifest.xml" }),
		...nativeLibEntries(options.nativeLibs || {}),
		...assetEntries(options.assets || {})
	];
	const key = getOrCreateSigningKey(String(options.keyDir || ""));
	const signed = signApkEntries(entries, key, options.schemes || {});
	return Object.freeze({
		bytes: signed.bytes,
		evidence: Object.freeze({
			manifest: manifest.evidence,
			packageName: specification.packageName,
			signing: signed.evidence
		}),
		mode: "scratch-native-app-to-signed-apk-v1"
	});
}

function validatePackageName(value) {
	const name = String(value || "");
	if (!/^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z][A-Za-z0-9_]*)+$/.test(name)) {
		throw nativeApkError("APK_PACKAGE_INVALID", name);
	}
	return name;
}

function normalizeNativeActivity(input) {
	const source = input && typeof input === "object" ? input : {};
	let libName = String(source.libName === undefined ? "merkava" : source.libName);
	if (/\.so$/i.test(libName)) libName = libName.replace(/\.so$/i, "").replace(/^lib/i, "");
	if (!/^[A-Za-z0-9_]+$/.test(libName)) throw nativeApkError("APK_NATIVE_ACTIVITY_LIB_INVALID", libName);
	return Object.freeze({
		configChanges: String(source.configChanges || "orientation|keyboardHidden|screenSize"),
		libName
	});
}

function nativeLibEntries(nativeLibs) {
	const entries = [];
	for (const [abi, libs] of Object.entries(nativeLibs)) {
		if (!/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(abi)) throw nativeApkError("APK_NATIVE_ABI_INVALID", abi);
		for (const [fileName, value] of Object.entries(libs || {})) {
			if (!/^[A-Za-z0-9_][A-Za-z0-9_.+-]*\.so$/.test(fileName)) {
				throw nativeApkError("APK_NATIVE_LIB_NAME_INVALID", fileName);
			}
			const bytes = toBytes(value);
			if (!bytes.length) throw nativeApkError("APK_NATIVE_LIB_EMPTY", fileName);
			entries.push(Object.freeze({ alignment: 4096, bytes, name: `lib/${abi}/${fileName}` }));
		}
	}
	return entries;
}

function assetEntries(assets) {
	return Object.entries(assets).map(([relativePath, value]) => {
		const path = String(relativePath || "");
		if (!path || path.startsWith("/") || path.includes("\\")
			|| path.split("/").some((part) => ["", ".", ".."].includes(part))) {
			throw nativeApkError("APK_ASSET_PATH_INVALID", path);
		}
		return Object.freeze({ alignment: 4, bytes: toBytes(value), name: `assets/${path}` });
	});
}

function toBytes(value) {
	if (value instanceof Uint8Array) return Uint8Array.from(value);
	if (typeof value === "string") return new TextEncoder().encode(value);
	if (ArrayBuffer.isView(value)) {
		return new Uint8Array(value.buffer, value.byteOffset, value.byteLength).slice();
	}
	throw nativeApkError("APK_ASSET_BYTES_REQUIRED");
}

function nativeApkError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
