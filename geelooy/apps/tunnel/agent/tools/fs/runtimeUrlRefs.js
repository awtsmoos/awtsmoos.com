// B"H
const Paths = require("./runtimeUrlPaths.js");

/** B"H — Finds fetchable dependencies without evaluating source. */
function refsFrom(text, fromKey, fromUrl, kind) {
	const refs = [];
	const push = spec => {
		const resolved = Paths.resolveUrl(spec, fromUrl);
		if (!resolved) return;
		refs.push({
			url: resolved.href,
			key: Paths.keyFor(spec, fromKey, resolved),
			kind: Paths.kindFor(resolved.pathname)
		});
	};
	for (const spec of htmlRefs(text, kind)) push(spec);
	for (const spec of jsRefs(text, kind)) push(spec);
	for (const spec of cssRefs(text, kind)) push(spec);
	return Paths.uniqueRefs(refs);
}

function htmlRefs(text, kind) {
	if (kind !== "html") return [];
	const refs = [];
	for (const match of String(text || "").matchAll(
		/<(?:script|link)\b[^>]*?\b(?:src|href)=["']([^"']+)["']/gi
	)) refs.push(match[1]);
	for (const match of String(text || "").matchAll(
		/<script[^>]+type=["']importmap["'][^>]*>([\s\S]*?)<\/script>/gi
	)) refs.push(...importMapRefs(match[1]));
	return refs;
}

function jsRefs(text, kind) {
	if (kind !== "js" && kind !== "html") return [];
	const source = String(text || "");
	const refs = [];
	for (const match of source.matchAll(
		/\bimport\s+(?:[^('";]+?\s+from\s+)?["']([^"']+)["']/g
	)) refs.push(match[1]);
	for (const match of source.matchAll(
		/\bexport\s+[^;"']*?\s+from\s+["']([^"']+)["']/g
	)) refs.push(match[1]);
	for (const match of source.matchAll(
		/\bimport\(\s*["']([^"']+)["']\s*\)/g
	)) refs.push(match[1]);
	for (const match of source.matchAll(
		/\bimport\(\s*`([^`$]+)(?:\?[^`$]*)?`\s*\)/g
	)) refs.push(match[1]);
	refs.push(...constantDynamicImports(source));
	refs.push(...safeAbsoluteModuleRefs(source));
	return refs;
}

function constantDynamicImports(source) {
	const constants = new Map();
	const refs = [];
	for (const match of source.matchAll(
		/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([`'"])([\s\S]*?)\2\s*;/g
	)) constants.set(match[1], match[3].split("?")[0]);
	for (const match of source.matchAll(/\bimport\(\s*([A-Za-z_$][\w$]*)\s*\)/g)) {
		const spec = constants.get(match[1]);
		if (looksLikeModuleSpec(spec)) refs.push(spec);
	}
	return refs;
}

function safeAbsoluteModuleRefs(source) {
	const refs = [];
	for (const match of String(source || "").matchAll(
		/["'`]([^"'`]*\.(?:mjs|js|css|json)(?:\?[^"'`]*)?)["'`]/g
	)) {
		const spec = match[1].split("?")[0];
		if (looksLikeModuleSpec(spec)) refs.push(spec);
	}
	return refs;
}

function looksLikeModuleSpec(spec) {
	return typeof spec === "string"
		&& (/^\.{1,2}\//.test(spec) || /^\//.test(spec))
		&& /\.(?:mjs|js|css|json)$/i.test(spec.split(/[?#]/)[0]);
}

function cssRefs(text, kind) {
	if (kind !== "css") return [];
	return [...String(text || "").matchAll(
		/@import\s+(?:url\()?['"]?([^'";)]+)['"]?\)?/g
	)].map(match => match[1]);
}

function importMapRefs(source) {
	try {
		const map = JSON.parse(String(source || "{}"));
		return Object.values(map.imports || {}).filter(value => {
			return typeof value === "string" && !value.endsWith("/");
		});
	} catch (_) {
		return [];
	}
}

module.exports = { refsFrom };
