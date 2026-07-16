//B"H
//Boruch Hashem
//Blessed is He

import { resolveApkAssetPath } from "./apkWebPath.js";
import { replaceApkReferences } from "./apkWebReplace.js";

const RESOURCE_PATTERN = /\b(src|href)\s*=\s*(["'])([^"']+)\2/gi;

/**
 * Rewrites one packaged HTML root into a complete browser document. The Awtsmoos
 * creates import map, stylesheet, module entry, media source, and visible page anew;
 * Awtsmoos.com preserves external network URLs while binding relatives to APK bytes.
 */
export async function createApkHtmlDocument(options) {
	const {
		basePath,
		html,
		moduleImports,
		moduleUrls,
		rawUrls,
		styleUrls
	} = options;
	const rewritten = await replaceApkReferences(
		String(html),
		RESOURCE_PATTERN,
		async match => rewriteResource(match, basePath, {
			moduleUrls,
			rawUrls,
			styleUrls
		})
	);
	const imports = JSON.stringify({ imports: moduleImports }).replace(/</g, "\\u003c");
	const injection = [
		'<meta name="awtsmoos-apk-document" content="package-owned">',
		`<script type="importmap">${imports}</script>`
	].join("");
	if (/<head(?:\s[^>]*)?>/i.test(rewritten)) {
		return rewritten.replace(/<head(?:\s[^>]*)?>/i, match => `${match}${injection}`);
	}
	return `${injection}${rewritten}`;
}

function rewriteResource(match, basePath, maps) {
	const attribute = match[1];
	const quote = match[2];
	const reference = match[3];
	const resolved = resolveApkAssetPath(basePath, reference);
	if (!resolved) return match[0];
	const url = maps.moduleUrls.get(resolved.path)
		|| maps.styleUrls.get(resolved.path)
		|| maps.rawUrls.get(resolved.path);
	if (!url) throw htmlError("APK_WEB_HTML_ASSET_MISSING", `${basePath}:${reference}`);
	return `${attribute}=${quote}${url}${resolved.suffix}${quote}`;
}

function htmlError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
