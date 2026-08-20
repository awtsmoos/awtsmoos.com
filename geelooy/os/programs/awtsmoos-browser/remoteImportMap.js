//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RemoteImportMap
 * @description The Awtsmoos gives bare module names only live document-declared
 * roads; Awtsmoos.com silences comments, templates, and non-authoritative script
 * bodies before honoring exact, prefix, and scoped import-map mappings.
 */

import { canonicalRemoteUrl } from "./remoteResourceAddress.js";
import { maskHtmlImportMapContexts } from "./remoteMarkupMask.js";

export function importMapFromHtml(html, pageUrl) {
	const map = { imports: {}, scopes: {}, warnings: [] };
	const source = maskHtmlImportMapContexts(String(html || ""));
	const pattern = /<script\b([^>]*)type\s*=\s*["']importmap["']([^>]*)>([\s\S]*?)<\/script\s*>/gi;
	for (const match of source.matchAll(pattern)) {
		try {
			const parsed = JSON.parse(match[3] || "{}");
			mergeMappings(map.imports, parsed.imports, pageUrl, map.warnings);
			for (const [scope, mappings] of Object.entries(parsed.scopes || {})) {
				const scopeUrl = safeCanonical(scope, pageUrl, map.warnings, "scope");
				if (!scopeUrl) continue;
				map.scopes[scopeUrl] ||= {};
				mergeMappings(map.scopes[scopeUrl], mappings, pageUrl, map.warnings);
			}
		} catch {
			map.warnings.push({ code: "REMOTE_IMPORT_MAP_INVALID_JSON" });
		}
	}
	return map;
}

export function resolveMappedSpecifier(specifier, parentUrl, importMap = {}) {
	const spec = String(specifier || "");
	if (urlLikeSpecifier(spec)) {
		try {
			return canonicalRemoteUrl(spec, parentUrl);
		} catch {
			return null;
		}
	}
	const scoped = matchingScope(parentUrl, importMap.scopes || {});
	return resolveFromMappings(spec, scoped)
		|| resolveFromMappings(spec, importMap.imports || {});
}

function mergeMappings(target, mappings, pageUrl, warnings) {
	for (const [specifier, value] of Object.entries(mappings || {})) {
		const mapped = safeCanonical(value, pageUrl, warnings, "mapping");
		if (!mapped) continue;
		if (specifier.endsWith("/") && !mapped.endsWith("/")) {
			warnings.push({ code: "REMOTE_IMPORT_MAP_PREFIX_INVALID", specifier });
			continue;
		}
		target[specifier] = mapped;
	}
}

function matchingScope(parentUrl, scopes) {
	const matches = Object.keys(scopes)
		.filter(scope => String(parentUrl || "").startsWith(scope))
		.sort((left, right) => right.length - left.length);
	return matches.length ? scopes[matches[0]] : null;
}

function resolveFromMappings(specifier, mappings) {
	if (!mappings) return null;
	if (mappings[specifier]) return mappings[specifier];
	const prefix = Object.keys(mappings)
		.filter(key => key.endsWith("/") && specifier.startsWith(key))
		.sort((left, right) => right.length - left.length)[0];
	if (!prefix) return null;
	try {
		return canonicalRemoteUrl(specifier.slice(prefix.length), mappings[prefix]);
	} catch {
		return null;
	}
}

function safeCanonical(value, base, warnings, kind) {
	try {
		return canonicalRemoteUrl(value, base);
	} catch {
		warnings.push({ code: "REMOTE_IMPORT_MAP_URL_INVALID", kind, value: String(value || "") });
		return null;
	}
}

function urlLikeSpecifier(value) {
	return value.startsWith(".") || value.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(value);
}
