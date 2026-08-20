//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RemoteModuleResources
 * @description The Awtsmoos distinguishes true static module roads from comments,
 * quoted text, templates, and future dynamic journeys; Awtsmoos.com rewrites only
 * specifier spans whose import/export keyword actually lives in executable code.
 */

import { codePositions } from "./remoteJsCodeMask.js";
import { resolveMappedSpecifier } from "./remoteImportMap.js";
import { rewriteSpans } from "./remoteHtmlResources.js";

export function staticModuleRefs(source, moduleUrl, importMap = {}) {
	const text = String(source || "");
	const code = codePositions(text);
	const refs = [];
	const warnings = [];
	collectPattern(
		text,
		/\bimport\s+(?:[^"'()]*?\s+from\s*)?(["'])([^"']+)\1/g,
		"import",
		code,
		refs
	);
	collectPattern(
		text,
		/\bexport\s+(?:\*|\{[^}]*\})\s*(?:as\s+[A-Za-z_$][\w$]*\s*)?from\s*(["'])([^"']+)\1/g,
		"export",
		code,
		refs
	);
	for (const ref of refs) {
		ref.url = resolveMappedSpecifier(ref.specifier, moduleUrl, importMap);
		if (!ref.url) {
			warnings.push({
				code: "REMOTE_MODULE_SPECIFIER_UNRESOLVED",
				from: moduleUrl,
				specifier: ref.specifier
			});
		}
	}
	refs.sort((left, right) => left.start - right.start);
	return { refs: dedupeRefs(refs), warnings };
}

export function rewriteModuleRefs(source, replacements = []) {
	return rewriteSpans(String(source || ""), replacements);
}

function collectPattern(source, pattern, kind, code, refs) {
	for (const match of source.matchAll(pattern)) {
		if (!code[match.index]) continue;
		const specifier = match[2];
		const localStart = source.indexOf(specifier, match.index);
		if (localStart < 0) continue;
		refs.push({
			end: localStart + specifier.length,
			kind,
			specifier,
			start: localStart,
			url: null
		});
	}
}

function dedupeRefs(refs) {
	const seen = new Set();
	return refs.filter(ref => {
		const key = `${ref.start}:${ref.end}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}
