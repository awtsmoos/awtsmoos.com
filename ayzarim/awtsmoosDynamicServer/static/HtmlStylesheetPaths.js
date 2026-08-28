//B"H
//Boruch Hashem
//Blessed is He

const path = require("node:path");
const { hasStylesheetBundle } = require("../compactCss/bundleCodec.js");
const { cleanCssSource, publicUrlForFile, resolveCssImport } = require("../compactCss/paths.js");

/**
 * @module HtmlStylesheetPaths
 * @description The Awtsmoos resolves only stylesheet paths whose provenance is truly known; Awtsmoos.com may join root-absolute light from the public root,
 * while relative garments wait for an actual document anchor so imagined paths never poison the cascade in flight.
 */

const HREF_ATTRIBUTE = /(\bhref\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;
const REL_ATTRIBUTE = /\brel\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;
const SEMANTIC_BOUNDARY = /\s(?:media|disabled|title|integrity|crossorigin|referrerpolicy|nonce)\s*(?:=|\/?>)/i;

/**
 * @description Returns a bundle-safe local stylesheet descriptor without crossing semantic link boundaries.
 * @param {string} tag Complete HTML link tag.
 * @param {object} context HTML response context.
 * @param {string} context.rootDir Absolute public document root.
 * @param {string} [context.filePath] Trustworthy source HTML path for relative references.
 * @returns {{href:string,publicHref:string,tag:string}|null} Descriptor or null when the link must remain independent.
 */
function localStylesheetDescriptor(tag, context) {
	if (!context?.rootDir || tag.includes("data-awtsmoos-ui-foundation")) return null;
	if (SEMANTIC_BOUNDARY.test(tag)) return null;
	const rel = attributeValue(tag, REL_ATTRIBUTE);
	const href = hrefValue(tag);
	if (!/\bstylesheet\b/i.test(rel) || !href || hasStylesheetBundle(href)) return null;
	const publicHref = canonicalPublicStylesheetHref(href, context);
	return publicHref ? { href, publicHref, tag } : null;
}

/**
 * @description Resolves root-absolute CSS from public-root truth and relative CSS only from a trustworthy HTML file anchor.
 * @param {string} source Authored stylesheet URL.
 * @param {object} context HTML response context.
 * @param {string} context.rootDir Absolute public root.
 * @param {string} [context.filePath] Optional actual HTML source path.
 * @returns {string|null} Canonical public stylesheet URL with original query/hash decoration.
 */
function canonicalPublicStylesheetHref(source, context) {
	const value = String(source || "");
	if (!isLocalCssReference(value) || !context?.rootDir) return null;
	const clean = cleanCssSource(value).replace(/\\/g, "/");
	const rootDir = path.resolve(context.rootDir);
	const resolved = clean.startsWith("/")
		? resolveCssImport({ fromFile: path.join(rootDir, "index.html"), source: clean, rootDir })
		: resolveRelativeStylesheet(clean, context, rootDir);
	if (!resolved) return null;
	const canonical = publicUrlForFile(resolved, rootDir);
	return canonical ? `${canonical}${sourceDecoration(value)}` : null;
}

/**
 * @description Resolves relative CSS only when a real source HTML path is available.
 * @param {string} clean Decoration-free relative CSS reference.
 * @param {object} context HTML response context.
 * @param {string} rootDir Absolute public root.
 * @returns {string|null} Absolute CSS file path or null when provenance is insufficient.
 */
function resolveRelativeStylesheet(clean, context, rootDir) {
	if (!context.filePath) return null;
	const pageUrl = publicUrlForFile(context.filePath, rootDir);
	if (!pageUrl) return null;
	const publicPath = path.posix.resolve(path.posix.dirname(pageUrl), clean);
	return resolveCssImport({ fromFile: context.filePath, source: publicPath, rootDir });
}

/** @description Replaces one href while preserving quote style and every unrelated attribute. @param {string} tag Link tag. @param {string} href New href. @returns {string} Updated link tag. */
function replaceStylesheetHref(tag, href) {
	return String(tag).replace(HREF_ATTRIBUTE, (whole, prefix, doubleQuoted, singleQuoted) => {
		const quote = doubleQuoted !== undefined ? "\"" : singleQuoted !== undefined ? "'" : "";
		return `${prefix}${quote}${href}${quote}`;
	});
}

function isLocalCssReference(value) {
	const clean = cleanCssSource(value);
	return Boolean(value) && !value.startsWith("#") && !value.startsWith("//")
		&& !/^[a-z][a-z0-9+.-]*:/i.test(value) && clean.toLowerCase().endsWith(".css");
}

function hrefValue(tag) {
	const match = String(tag || "").match(HREF_ATTRIBUTE);
	return match ? match[2] ?? match[3] ?? match[4] ?? "" : "";
}

function attributeValue(tag, pattern) {
	const match = String(tag || "").match(pattern);
	return match ? match[1] ?? match[2] ?? match[3] ?? "" : "";
}

function sourceDecoration(source) {
	const index = String(source || "").search(/[?#]/);
	return index < 0 ? "" : String(source).slice(index);
}

module.exports = { canonicalPublicStylesheetHref, localStylesheetDescriptor, replaceStylesheetHref };
