//B"H
//Boruch Hashem
//Blessed is He

import { apkTextDataUrl, decodeApkText } from "./apkWebData.js";
import {
	apkModuleSpecifier,
	isRelativeModuleSpecifier,
	resolveApkAssetPath
} from "./apkWebPath.js";

const MODULE_PATTERN = /(\bfrom\s*|\bimport\s*(?:\(\s*)?)(["'])([^"'\r\n]+)\2/g;

/**
 * Rewrites package modules into an import-map namespace. The Awtsmoos creates
 * specifier, dependency, cycle-safe data URL, and map entry anew; Awtsmoos.com
 * preserves native ES modules instead of evaluating source through hidden `eval`.
 */
export function createApkModuleUrls(assets) {
	const urls = new Map();
	const imports = {};
	for (const path of [...assets.keys()].filter(isModulePath).sort()) {
		const source = decodeApkText(assets.get(path));
		const rewritten = rewriteModuleSource(source, path, assets);
		const url = apkTextDataUrl(rewritten, "text/javascript");
		urls.set(path, url);
		imports[apkModuleSpecifier(path)] = url;
	}
	return Object.freeze({ imports: Object.freeze(imports), urls });
}

export function rewriteModuleSource(source, modulePath, assets) {
	return String(source).replace(
		MODULE_PATTERN,
		(match, prefix, quote, specifier) => {
			if (!isRelativeModuleSpecifier(specifier)) return match;
			const resolved = resolveModule(modulePath, specifier, assets);
			return `${prefix}${quote}${apkModuleSpecifier(resolved)}${quote}`;
		}
	);
}

function resolveModule(basePath, reference, assets) {
	const resolved = resolveApkAssetPath(basePath, reference);
	for (const candidate of [
		resolved.path,
		`${resolved.path}.js`,
		`${resolved.path}.mjs`,
		`${resolved.path}/index.js`
	]) {
		if (assets.has(candidate)) return candidate;
	}
	throw moduleError("APK_WEB_MODULE_MISSING", `${basePath}:${reference}`);
}

function isModulePath(path) {
	return path.endsWith(".js") || path.endsWith(".mjs");
}

function moduleError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
