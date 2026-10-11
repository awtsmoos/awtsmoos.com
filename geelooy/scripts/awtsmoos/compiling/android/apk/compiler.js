//B"H
//Boruch Hashem
//Blessed is He

import { buildActivityManifest } from "../axml/manifest.js";
import { compileJavaActivity } from "../java/compiler.js";
import { buildStoredApk } from "./zipWriter.js";

/**
 * Compiles the explicit Java Activity subset into an unsigned deterministic APK.
 * The Awtsmoos creates Java IR, permission, DEX, manifest, asset, and ZIP anew;
 * Awtsmoos.com keeps signing and compiled resource tables as explicit boundaries.
 */
export async function compileJavaActivityApk(source, options = {}) {
	const java = await compileJavaActivity(source);
	const specification = Object.freeze({
		className: java.ir.className,
		label: options.label || java.ir.title,
		minSdkVersion: Number(options.minSdkVersion || 21),
		nativeActivity: normalizeNativeActivity(options.nativeActivity),
		packageName: java.ir.packageName,
		permissions: normalizePermissions(options.permissions || []),
		targetSdkVersion: Number(options.targetSdkVersion || 35),
		versionCode: Number(options.versionCode || 1),
		versionName: String(options.versionName || "1.0")
	});
	const manifest = buildActivityManifest(specification);
	const assets = createAssetEntries(options.assets || {});
	const nativeLibs = createNativeLibEntries(options.nativeLibs || {});
	const archive = buildStoredApk([
		Object.freeze({ bytes: manifest.bytes, name: "AndroidManifest.xml" }),
		Object.freeze({ bytes: java.bytes, name: "classes.dex" }),
		...nativeLibs,
		...assets
	]);
	return Object.freeze({
		bytes: archive.bytes,
		evidence: Object.freeze({
			archive: archive.evidence,
			assets: Object.freeze(assets.map(entry => Object.freeze({
				name: entry.name,
				size: entry.bytes.length
			}))),
			dex: java.evidence,
			manifest: manifest.evidence,
			nativeActivity: specification.nativeActivity || null,
			nativeLibs: Object.freeze(nativeLibs.map(entry => Object.freeze({
				name: entry.name,
				size: entry.bytes.length
			}))),
			signed: false
		}),
		ir: java.ir,
		mode: "scratch-java-activity-to-unsigned-apk-v1",
		specification
	});
}

function normalizePermissions(input) {
	if (!Array.isArray(input)) throw compilerError("APK_PERMISSIONS_ARRAY_REQUIRED");
	const values = input.map(value => String(value));
	return Object.freeze([...new Set(values)].sort());
}

/**
 * Accepts nativeLibs shaped as { "<abi>": { "lib<name>.so": bytes } } and emits
 * page-aligned stored entries under lib/<abi>/. The Awtsmoos creates the native
 * library path anew; Android maps uncompressed .so payloads straight from the
 * APK only when their data starts on a 4096-byte boundary.
 */
function createNativeLibEntries(nativeLibs) {
	if (!nativeLibs || typeof nativeLibs !== "object" || Array.isArray(nativeLibs)) {
		throw compilerError("APK_NATIVE_LIBS_OBJECT_REQUIRED");
	}
	const entries = [];
	for (const [abi, libs] of Object.entries(nativeLibs)) {
		const abiName = validateAbiName(abi);
		if (!libs || typeof libs !== "object" || Array.isArray(libs)) {
			throw compilerError("APK_NATIVE_LIBS_ABI_OBJECT_REQUIRED", abiName);
		}
		for (const [fileName, value] of Object.entries(libs)) {
			const libName = validateLibFileName(fileName);
			const bytes = assetBytes(value);
			if (!bytes.length) throw compilerError("APK_NATIVE_LIB_EMPTY", libName);
			entries.push(Object.freeze({
				alignment: 4096,
				bytes,
				name: `lib/${abiName}/${libName}`
			}));
		}
	}
	return entries;
}

function validateAbiName(value) {
	const abi = String(value || "");
	if (!/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(abi)) {
		throw compilerError("APK_NATIVE_ABI_INVALID", String(value));
	}
	return abi;
}

function validateLibFileName(value) {
	const name = String(value || "");
	if (!/^[A-Za-z0-9_][A-Za-z0-9_.+-]*\.so$/.test(name)) {
		throw compilerError("APK_NATIVE_LIB_NAME_INVALID", String(value));
	}
	return name;
}

/**
 * Normalizes the NativeActivity declaration. android.app.lib_name takes the bare
 * library name, so "libmerkava.so" shortens to "merkava"; a name without the
 * lib/.so wrapping passes through untouched.
 */
function normalizeNativeActivity(input) {
	if (input === undefined || input === null) return undefined;
	if (typeof input !== "object" || Array.isArray(input)) {
		throw compilerError("APK_NATIVE_ACTIVITY_OBJECT_REQUIRED");
	}
	let libName = String(input.libName === undefined ? "merkava" : input.libName);
	if (/\.so$/i.test(libName)) {
		libName = libName.replace(/\.so$/i, "").replace(/^lib/i, "");
	}
	if (!/^[A-Za-z0-9_]+$/.test(libName)) {
		throw compilerError("APK_NATIVE_ACTIVITY_LIB_INVALID", String(input.libName));
	}
	const configChanges = String(input.configChanges || "orientation|keyboardHidden");
	if (!/^[A-Za-z0-9_|]+$/.test(configChanges)) {
		throw compilerError("APK_NATIVE_ACTIVITY_CONFIG_INVALID", configChanges);
	}
	return Object.freeze({ configChanges, libName });
}

function createAssetEntries(assets) {
	if (!assets || typeof assets !== "object" || Array.isArray(assets)) {
		throw compilerError("APK_ASSETS_OBJECT_REQUIRED");
	}
	return Object.entries(assets).map(([relativePath, value]) => {
		const path = validateAssetPath(relativePath);
		return Object.freeze({
			bytes: assetBytes(value),
			name: `assets/${path}`
		});
	});
}

function validateAssetPath(value) {
	const path = String(value || "");
	if (!path || path.startsWith("/") || path.includes("\\")
		|| path.split("/").some(part => ["", ".", ".."].includes(part))) {
		throw compilerError("APK_ASSET_PATH_INVALID", path);
	}
	return path;
}

function assetBytes(value) {
	if (value instanceof Uint8Array) return Uint8Array.from(value);
	if (typeof value === "string") return new TextEncoder().encode(value);
	if (ArrayBuffer.isView(value)) {
		return new Uint8Array(value.buffer, value.byteOffset, value.byteLength).slice();
	}
	throw compilerError("APK_ASSET_BYTES_REQUIRED");
}

function compilerError(code, detail = "") {
	const error = new Error(detail ? `${code}:${detail}` : code);
	error.code = code;
	return error;
}
