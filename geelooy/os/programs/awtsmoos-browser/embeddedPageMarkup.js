//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedPageMarkup
 * @description
 * The Awtsmoos separates living script doors from inert stories without executing a word.
 * Awtsmoos.com reuses the equal-length markup mask so source order remains exact while
 * comments and templates become silence; only afterward may trusted host code decide
 * which classic words enter the local browser vessel and which remain deferred outside.
 */

import { rewriteSpans } from "./remoteHtmlResources.js";
import { maskHtmlResourceContexts } from "./remoteMarkupMask.js";

const CLASSIC_TYPES = new Set([
	"",
	"text/javascript",
	"application/javascript",
	"text/ecmascript",
	"application/ecmascript"
]);

/**
 * Extracts live script records and strips executable/resource doors from guest markup.
 *
 * @param {string} html Original top-level HTML source.
 * @returns {{html:string,scripts:Array,warnings:Array,title:string}}
 * 	Sanitized host payload ingredients without executing guest code.
 */
export function embeddedPageMarkup(html) {
	const source = String(html || "");
	const searchable = maskHtmlResourceContexts(source);
	const warnings = [];
	const scripts = [];
	const removals = [];
	for (const match of searchable.matchAll(/<script\b[^>]*>/gi)) {
		const opening = match[0];
		const start = match.index;
		const bodyStart = start + opening.length;
		const closing = /<\/script\s*>/gi;
		closing.lastIndex = bodyStart;
		const closeMatch = closing.exec(searchable);
		if (!closeMatch) {
			warnings.push({ code: "EMBEDDED_SCRIPT_UNCLOSED", start });
			continue;
		}
		const end = closeMatch.index + closeMatch[0].length;
		const type = attributeValue(opening, "type").trim().toLowerCase();
		const src = attributeValue(opening, "src");
		const module = type === "module";
		const classic = CLASSIC_TYPES.has(type);
		if (classic && !src) {
			scripts.push({ end, kind: "inline", source: source.slice(bodyStart, closeMatch.index), start });
		} else if (!classic && !module) {
			warnings.push({ code: "EMBEDDED_SCRIPT_TYPE_DEFERRED", start, type: type || "unknown" });
		}
		if (module) warnings.push({ code: "EMBEDDED_MODULE_DEFERRED", start });
		removals.push({ end, start, value: "" });
	}
	for (const match of searchable.matchAll(/<link\b[^>]*>/gi)) {
		const rel = attributeValue(match[0], "rel").toLowerCase().split(/\s+/);
		if (!rel.includes("stylesheet")) continue;
		removals.push({ end: match.index + match[0].length, start: match.index, value: "" });
	}
	for (const match of searchable.matchAll(/<base\b[^>]*>/gi)) {
		removals.push({ end: match.index + match[0].length, start: match.index, value: "" });
	}
	return {
		html: rewriteSpans(source, removals),
		scripts,
		title: simpleTitle(source),
		warnings
	};
}

function attributeValue(tag, name) {
	const pattern = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'=<>]+))`, "i");
	const match = pattern.exec(tag);
	return match ? (match[1] ?? match[2] ?? match[3] ?? "") : "";
}

function simpleTitle(source) {
	const match = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(source);
	if (!match) return "";
	return match[1].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 240);
}
