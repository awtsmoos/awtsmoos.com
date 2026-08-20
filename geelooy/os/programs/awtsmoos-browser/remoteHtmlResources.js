//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RemoteHtmlResources
 * @description The Awtsmoos reads only live document-level resource doors;
 * Awtsmoos.com silences comments, templates, raw-text bodies, and script bodies at
 * equal length so inert stories cannot become external network authority.
 */

import { resolveRemoteUrl } from "./remoteResourceAddress.js";
import { maskHtmlResourceContexts } from "./remoteMarkupMask.js";

export function htmlResourceRefs(html, pageUrl) {
	const source = String(html || "");
	const searchable = maskHtmlResourceContexts(source);
	const refs = [];
	const warnings = [];
	for (const match of searchable.matchAll(/<script\b[^>]*>/gi)) {
		const src = attributeValue(match[0], "src", match.index);
		if (!src) continue;
		const type = attributeValue(match[0], "type", match.index)?.value || "";
		if (!scriptType(type)) continue;
		pushRef(refs, warnings, {
			attribute: src,
			kind: "script",
			module: type.trim().toLowerCase() === "module"
		}, pageUrl);
	}
	for (const match of searchable.matchAll(/<link\b[^>]*>/gi)) {
		const rel = attributeValue(match[0], "rel", match.index)?.value || "";
		if (!rel.toLowerCase().split(/\s+/).includes("stylesheet")) continue;
		const href = attributeValue(match[0], "href", match.index);
		if (!href) continue;
		pushRef(refs, warnings, {
			attribute: href,
			kind: "style",
			module: false
		}, pageUrl);
	}
	return { refs, warnings };
}

export function rewriteHtmlResources(html, replacements = []) {
	return rewriteSpans(String(html || ""), replacements);
}

export function rewriteSpans(source, replacements = []) {
	let output = String(source || "");
	const ordered = [...replacements].sort((left, right) => right.start - left.start);
	for (const item of ordered) {
		if (!Number.isInteger(item.start) || !Number.isInteger(item.end)) continue;
		output = output.slice(0, item.start) + String(item.value) + output.slice(item.end);
	}
	return output;
}

function pushRef(refs, warnings, input, pageUrl) {
	try {
		refs.push({
			end: input.attribute.end,
			kind: input.kind,
			module: input.module,
			specifier: input.attribute.value,
			start: input.attribute.start,
			url: resolveRemoteUrl(input.attribute.value, pageUrl)
		});
	} catch (error) {
		warnings.push({
			code: error?.code || "REMOTE_HTML_RESOURCE_URL_INVALID",
			kind: input.kind,
			specifier: input.attribute.value
		});
	}
}

function attributeValue(tag, name, tagOffset) {
	const pattern = new RegExp(
		`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>]+))`,
		"i"
	);
	const match = pattern.exec(tag);
	if (!match) return null;
	const value = match[1] ?? match[2] ?? match[3] ?? "";
	const localStart = tag.indexOf(value, match.index);
	return {
		end: tagOffset + localStart + value.length,
		start: tagOffset + localStart,
		value
	};
}

function scriptType(value) {
	const type = String(value || "").trim().toLowerCase();
	return !type
		|| type === "module"
		|| type === "text/javascript"
		|| type === "application/javascript"
		|| type === "text/ecmascript"
		|| type === "application/ecmascript";
}
