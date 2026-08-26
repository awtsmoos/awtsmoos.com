//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedPagePayload
 * @description
 * The Awtsmoos joins source-order testimony to the bounded resource constellation.
 * Awtsmoos.com admits only same-origin classic words and styles whose fetched record
 * truly exists; redirects and foreign bodies never become a secret oracle through
 * convenience, while inline and external light retain the order in which the page spoke.
 */

import { embeddedPageMarkup } from "./embeddedPageMarkup.js";
import { htmlResourceRefs } from "./remoteHtmlResources.js";

/**
 * Builds the inert host-to-guest render payload from source HTML and a resource graph.
 *
 * @param {Object} input Original HTML, canonical page URL, and collected graph.
 * @returns {{html:string,css:string,scripts:string[],title:string,url:string,warnings:Array}}
 * 	Guest render payload containing no ambient executable resource doors.
 */
export function buildEmbeddedPagePayload(input = {}) {
	const pageUrl = canonicalPageUrl(input.pageUrl);
	const originalHtml = String(input.html || "");
	const graph = requiredGraph(input.graph);
	const parsed = embeddedPageMarkup(originalHtml);
	const discovered = htmlResourceRefs(originalHtml, pageUrl);
	const aliases = manifestAliases(graph.manifest);
	const warnings = [...parsed.warnings, ...discovered.warnings];
	const scriptActions = parsed.scripts.map(item => ({
		position: item.start,
		source: item.source
	}));
	const styleActions = [];
	for (const ref of discovered.refs) {
		const record = aliases.get(ref.url);
		if (!record) {
			warnings.push(resourceWarning("EMBEDDED_RESOURCE_MISSING", ref));
			continue;
		}
		if (!samePageOrigin(pageUrl, ref.url) || !samePageOrigin(pageUrl, record.url)) {
			warnings.push(resourceWarning("EMBEDDED_CROSS_ORIGIN_RESOURCE_DEFERRED", ref));
			continue;
		}
		const source = graph.files[record.fileKey];
		if (typeof source !== "string" || record.kind !== ref.kind) {
			warnings.push(resourceWarning("EMBEDDED_RESOURCE_RECORD_INVALID", ref));
			continue;
		}
		if (ref.kind === "style") {
			styleActions.push({ position: ref.start, source });
			continue;
		}
		if (ref.module) {
			warnings.push(resourceWarning("EMBEDDED_MODULE_DEFERRED", ref));
			continue;
		}
		scriptActions.push({ position: ref.start, source });
	}
	return {
		css: orderedSources(styleActions).join("\n\n"),
		html: parsed.html,
		scripts: orderedSources(scriptActions),
		title: parsed.title,
		url: pageUrl,
		warnings
	};
}

function manifestAliases(manifest) {
	const aliases = new Map();
	for (const record of Array.isArray(manifest) ? manifest : []) {
		if (!record || typeof record !== "object") continue;
		if (record.requestedUrl) aliases.set(record.requestedUrl, record);
		if (record.url) aliases.set(record.url, record);
	}
	return aliases;
}

function orderedSources(items) {
	return [...items]
		.sort((left, right) => left.position - right.position)
		.map(item => item.source);
}

function resourceWarning(code, ref) {
	return {
		code,
		kind: ref.kind,
		url: ref.url
	};
}

function samePageOrigin(pageUrl, candidate) {
	try {
		return new URL(candidate).origin === new URL(pageUrl).origin;
	} catch {
		return false;
	}
}

function canonicalPageUrl(value) {
	try {
		return new URL(String(value || "")).href;
	} catch {
		throw new TypeError("BROWSER_EMBEDDED_PAGE_URL_INVALID");
	}
}

function requiredGraph(value) {
	if (!value || typeof value.files !== "object" || !Array.isArray(value.manifest)) {
		throw new TypeError("BROWSER_EMBEDDED_RESOURCE_GRAPH_REQUIRED");
	}
	return value;
}
