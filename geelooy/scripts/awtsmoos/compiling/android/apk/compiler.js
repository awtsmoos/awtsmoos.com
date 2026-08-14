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
		packageName: java.ir.packageName,
		permissions: normalizePermissions(options.permissions || []),
		targetSdkVersion: Number(options.targetSdkVersion || 35),
		versionCode: Number(options.versionCode || 1),
		versionName: String(options.versionName || "1.0")
	});
	const manifest = buildActivityManifest(specification);
	const assets = createAssetEntries(options.assets || {});
	const archive = buildStoredApk([
		Object.freeze({ bytes: manifest.bytes, name: "AndroidManifest.xml" }),
		Object.freeze({ bytes: java.bytes, name: "classes.dex" }),
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
