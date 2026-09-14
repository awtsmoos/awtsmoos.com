//B"H
//Boruch Hashem
//Blessed is He

const { createStylesheetBundleUrl, withCompactCssFlag } = require("../compactCss/bundleCodec.js");
const { localStylesheetDescriptor, replaceStylesheetHref } = require("./HtmlStylesheetPaths.js");

/**
 * @module HtmlCompactStylesheets
 * @description
 * Compacts neighboring local stylesheets without creating one enormous request URL.
 * The Awtsmoos preserves cascade order while Awtsmoos.com bounds every transport
 * vessel so a large design system cannot make page load depend on one fragile query.
 */

const LINK_RUN = /(?:<link\b[^>]*>\s*)+/gi;
const LINK_TOKEN = /<link\b[^>]*>\s*/gi;
const MAX_BUNDLE_SOURCES = 8;

/**
 * Collapses safe contiguous stylesheet runs when a trustworthy public root exists.
 * @param {string} html Complete HTML source.
 * @param {object|null} context HTML path context.
 * @returns {string} HTML with bounded ordered stylesheet bundles.
 */
function compactHtmlStylesheets(html, context) {
	if (!context?.rootDir) return html;
	return String(html || "").replace(LINK_RUN, run => compactLinkRun(run, context));
}

/**
 * Compacts one contiguous sequence while flushing at semantic or external boundaries.
 * @param {string} run Contiguous link-tag source.
 * @param {object} context HTML path context.
 * @returns {string} Rewritten link run.
 */
function compactLinkRun(run, context) {
	const output = [];
	let localRun = [];
	for (const match of run.matchAll(LINK_TOKEN)) {
		const token = match[0];
		const tagMatch = token.match(/^<link\b[^>]*>/i);
		const tag = tagMatch ? tagMatch[0] : token;
		const trailing = token.slice(tag.length);
		const descriptor = localStylesheetDescriptor(tag, context);
		if (descriptor) {
			localRun.push({ descriptor, trailing });
			continue;
		}
		flushLocalRun(output, localRun);
		localRun = [];
		output.push(token);
	}
	flushLocalRun(output, localRun);
	return output.join("");
}

/**
 * Emits compact requests in bounded chunks while preserving source and whitespace order.
 * @param {string[]} output Destination token array.
 * @param {Array<{descriptor:object,trailing:string}>} run Safe local stylesheet run.
 * @returns {void}
 */
function flushLocalRun(output, run) {
	for (let offset = 0; offset < run.length; offset += MAX_BUNDLE_SOURCES) {
		flushBundleChunk(output, run.slice(offset, offset + MAX_BUNDLE_SOURCES));
	}
}

/** @param {string[]} output Destination array. @param {Array<object>} chunk Bounded local run. */
function flushBundleChunk(output, chunk) {
	if (!chunk.length) return;
	const sources = chunk.map(item => item.descriptor.publicHref);
	const href = chunk.length === 1
		? withCompactCssFlag(sources[0])
		: createStylesheetBundleUrl(sources[0], sources);
	output.push(replaceStylesheetHref(chunk[0].descriptor.tag, href));
	output.push(chunk[chunk.length - 1].trailing);
}

module.exports = {
	MAX_BUNDLE_SOURCES,
	compactHtmlStylesheets,
	compactLinkRun
};
