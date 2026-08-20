//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RemoteCssResources
 * @description The Awtsmoos follows only live textual stylesheet imports while
 * inert CSS commentary becomes equal-length silence; Awtsmoos.com leaves image and
 * font garments for a later street and preserves exact offsets for safe rewrites.
 */

import { resolveRemoteUrl } from "./remoteResourceAddress.js";
import { rewriteSpans } from "./remoteHtmlResources.js";

export function cssImportRefs(source, stylesheetUrl) {
	const text = String(source || "");
	const searchable = withoutCssComments(text);
	const refs = [];
	const warnings = [];
	for (const match of searchable.matchAll(importPattern())) {
		const specifier = match[1];
		const localStart = text.indexOf(specifier, match.index);
		pushResolved(refs, warnings, {
			end: localStart + specifier.length,
			specifier,
			start: localStart
		}, stylesheetUrl, "REMOTE_CSS_IMPORT_URL_INVALID");
	}
	return { refs, warnings };
}

export function cssAssetRefs(source, stylesheetUrl) {
	const text = String(source || "");
	const searchable = withoutCssComments(text);
	const importRanges = [...searchable.matchAll(importPattern())]
		.map(match => [match.index, match.index + match[0].length]);
	const assets = [];
	const warnings = [];
	for (const match of searchable.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
		if (importRanges.some(([start, end]) => match.index >= start && match.index < end)) continue;
		const specifier = match[1].trim();
		if (/^data:/i.test(specifier)) continue;
		pushResolved(assets, warnings, { specifier }, stylesheetUrl, "REMOTE_CSS_ASSET_URL_INVALID");
	}
	return { assets, warnings };
}

export function rewriteCssImports(source, replacements = []) {
	return rewriteSpans(String(source || ""), replacements);
}

function pushResolved(output, warnings, item, parentUrl, code) {
	try {
		output.push({
			...item,
			url: resolveRemoteUrl(item.specifier, parentUrl)
		});
	} catch {
		warnings.push({ code, from: parentUrl, specifier: item.specifier });
	}
}

function withoutCssComments(source) {
	return source.replace(/\/\*[\s\S]*?\*\//g, value => {
		return value.replace(/[^\n]/g, " ");
	});
}

function importPattern() {
	return /@import\s+(?:url\(\s*)?["']?([^"')\s;]+)["']?\s*\)?[^;]*;/gi;
}
