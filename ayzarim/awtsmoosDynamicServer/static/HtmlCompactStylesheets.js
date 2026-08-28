//B"H
//Boruch Hashem
//Blessed is He

const { createStylesheetBundleUrl, withCompactCssFlag } = require("../compactCss/bundleCodec.js");
const { localStylesheetDescriptor, replaceStylesheetHref } = require("./HtmlStylesheetPaths.js");

/**
 * @module HtmlCompactStylesheets
 * @description The Awtsmoos gathers contiguous local stylesheet garments into one ordered transport river; Awtsmoos.com preserves every semantic boundary,
 * letting root-absolute sheets unite from public-root truth while unresolved relative paths remain separate and alive.
 */

const LINK_RUN = /(?:<link\b[^>]*>\s*)+/gi;
const LINK_TOKEN = /<link\b[^>]*>\s*/gi;

/**
 * @description Collapses safe contiguous stylesheet runs when a trustworthy public root exists.
 * @param {string} html Complete HTML source.
 * @param {object|null} context HTML path context.
 * @param {string} context.rootDir Absolute public root.
 * @param {string} [context.filePath] Optional actual HTML source path for relative CSS.
 * @returns {string} HTML with safe stylesheet runs compacted.
 */
function compactHtmlStylesheets(html, context) {
	if (!context?.rootDir) return html;
	return String(html || "").replace(LINK_RUN, run => compactLinkRun(run, context));
}

/**
 * @description Compacts one contiguous sequence while flushing at every unbundlable or semantic boundary.
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
 * @description Emits one compact flag or ordered bundle URL for a collected local stylesheet run.
 * @param {string[]} output Destination token array.
 * @param {Array<{descriptor:object,trailing:string}>} run Safe local stylesheet run.
 * @returns {void}
 */
function flushLocalRun(output, run) {
	if (!run.length) return;
	const sources = run.map(item => item.descriptor.publicHref);
	const href = run.length === 1
		? withCompactCssFlag(sources[0])
		: createStylesheetBundleUrl(sources[0], sources);
	output.push(replaceStylesheetHref(run[0].descriptor.tag, href));
	output.push(run[run.length - 1].trailing);
}

module.exports = { compactHtmlStylesheets, compactLinkRun };
