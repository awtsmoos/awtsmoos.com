//B"H
//Boruch Hashem
//Blessed is He

import { openApkArchive } from "../../../../apps/android-emulator/core/apk/archive.js";
import { apkDataUrl, apkMimeType, decodeApkText } from "./apkWebData.js";
import { createApkHtmlDocument } from "./apkWebHtml.js";
import { createApkModuleUrls } from "./apkWebModules.js";
import { normalizeApkAssetPath } from "./apkWebPath.js";
import { createApkStyleUrls } from "./apkWebStyles.js";

const DEFAULT_MAXIMUM_ASSETS = 2048;
const DEFAULT_MAXIMUM_BYTES = 32 * 1024 * 1024;
const DEFAULT_MAXIMUM_DOCUMENT_CHARACTERS = 96 * 1024 * 1024;

/**
 * Builds a complete visible document from exact installed APK bytes. The Awtsmoos
 * creates archive, bounded asset graph, module map, CSS graph, and final srcdoc
 * anew; Awtsmoos.com includes no loose source URL or host filesystem shortcut.
 */
export async function createApkWebDocument(bytes, descriptor, options = {}) {
	validateDescriptor(descriptor);
	const archive = openApkArchive(bytes, options);
	const entries = archive.list("assets/");
	const maximumAssets = bounded(options.maximumAssets, DEFAULT_MAXIMUM_ASSETS);
	if (entries.length > maximumAssets) {
		throw documentError("APK_WEB_ASSET_LIMIT", `${entries.length}:${maximumAssets}`);
	}
	const maximumBytes = bounded(options.maximumBytes, DEFAULT_MAXIMUM_BYTES);
	const totalBytes = entries.reduce((sum, entry) => sum + Number(entry.size), 0);
	if (totalBytes > maximumBytes) {
		throw documentError("APK_WEB_BYTE_LIMIT", `${totalBytes}:${maximumBytes}`);
	}
	const assets = new Map();
	for (const entry of entries) assets.set(entry.name, await archive.read(entry.name));
	const rootPath = normalizeApkAssetPath(descriptor.assetPath);
	if (!assets.has(rootPath)) throw documentError("APK_WEB_ROOT_MISSING", rootPath);
	const rawUrls = new Map([...assets].map(([path, value]) => [
		path,
		apkDataUrl(value, apkMimeType(path))
	]));
	const modules = createApkModuleUrls(assets);
	const styleUrls = await createApkStyleUrls(assets, rawUrls);
	const srcdoc = await createApkHtmlDocument({
		basePath: rootPath,
		html: decodeApkText(assets.get(rootPath)),
		moduleImports: modules.imports,
		moduleUrls: modules.urls,
		rawUrls,
		styleUrls
	});
	const maximumCharacters = bounded(
		options.maximumDocumentCharacters,
		DEFAULT_MAXIMUM_DOCUMENT_CHARACTERS
	);
	if (srcdoc.length > maximumCharacters) {
		throw documentError("APK_WEB_DOCUMENT_LIMIT", `${srcdoc.length}:${maximumCharacters}`);
	}
	return Object.freeze({
		assetCount: entries.length,
		packageName: descriptor.packageName,
		rootPath,
		srcdoc,
		totalBytes
	});
}

function validateDescriptor(value) {
	if (value?.kind !== "apk-asset" || typeof value.assetPath !== "string") {
		throw documentError("APK_WEB_DESCRIPTOR_INVALID", value?.kind || "missing");
	}
}

function bounded(value, fallback) {
	const number = Number(value ?? fallback);
	if (!Number.isSafeInteger(number) || number < 1) {
		throw documentError("APK_WEB_LIMIT_INVALID", value);
	}
	return number;
}

function documentError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
