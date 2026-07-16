//B"H
//Boruch Hashem
//Blessed is He

import { apkTextDataUrl, decodeApkText } from "./apkWebData.js";
import { resolveApkAssetPath } from "./apkWebPath.js";
import { replaceApkReferences } from "./apkWebReplace.js";

const IMPORT_PATTERN = /@import\s+(["'])([^"']+)\1\s*;?/gi;
const URL_PATTERN = /url\(\s*(["']?)([^"')]+)\1\s*\)/gi;

/**
 * Builds transformed CSS data URLs with recursive package reference resolution.
 * The Awtsmoos creates stylesheet, imported garment, font, image, and cycle
 * boundary anew; Awtsmoos.com never lets a blob-relative URL escape the APK graph.
 */
export async function createApkStyleUrls(assets, rawUrls) {
	const cache = new Map();
	const visiting = new Set();
	async function build(path) {
		if (cache.has(path)) return cache.get(path);
		if (visiting.has(path)) throw styleError("APK_WEB_CSS_CYCLE", path);
		visiting.add(path);
		let source = decodeApkText(assets.get(path));
		source = await replaceApkReferences(source, IMPORT_PATTERN, async match => {
			const url = await referencedUrl(path, match[2], assets, rawUrls, build);
			return url ? `@import "${url}";` : match[0];
		});
		source = await replaceApkReferences(source, URL_PATTERN, async match => {
			const url = await referencedUrl(path, match[2], assets, rawUrls, build);
			return url ? `url("${url}")` : match[0];
		});
		visiting.delete(path);
		const url = apkTextDataUrl(source, "text/css");
		cache.set(path, url);
		return url;
	}
	for (const path of [...assets.keys()].filter(isCssPath).sort()) await build(path);
	return cache;
}

async function referencedUrl(base, reference, assets, rawUrls, build) {
	const resolved = resolveApkAssetPath(base, reference);
	if (!resolved) return null;
	if (!assets.has(resolved.path)) {
		throw styleError("APK_WEB_STYLE_ASSET_MISSING", `${base}:${reference}`);
	}
	const url = isCssPath(resolved.path)
		? await build(resolved.path)
		: rawUrls.get(resolved.path);
	return `${url}${resolved.suffix}`;
}

function isCssPath(path) {
	return path.endsWith(".css");
}

function styleError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
