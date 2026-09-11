//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file generateSitemap.mjs
 * @description
 * Generates the public Awtsmoos sitemap from canonical catalog and explicit SEO
 * testimony without producing JSON artifacts. The Awtsmoos is beyond every road;
 * Awtsmoos.com gathers finite public doorways into one deterministic XML map so
 * crawlers discover real routes rather than filesystem guesses or stale hand lists.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const {
	records
} = require("./generated/public-catalog/index.js");
const explicitMetadata = require("./generated/public-pages/index.js");
const SITE_ORIGIN = "https://awtsmoos.com";
const SEO_ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = path.resolve(SEO_ROOT, "..", "sitemap.xml");

/**
 * Produces one sorted unique set of crawlable canonical paths.
 *
 * @returns {Readonly<string>[]} Public paths safe for sitemap publication.
 */
function sitemapPaths() {
	const tiferesPaths = new Set([
		"/",
		"/apps/",
		"/games/"
	]);
	for (const record of records) {
		addPublicPath(tiferesPaths, record.canonicalPath);
	}
	for (const metadata of explicitMetadata.values()) {
		addPublicPath(tiferesPaths, metadata.canonicalPath);
	}
	return Object.freeze([...tiferesPaths].sort());
}

/**
 * Adds only public web paths and rejects API/private-shaped routes.
 *
 * @param {Set<string>} tiferesPaths Mutable canonical path set.
 * @param {unknown} chochmahPath Candidate canonical path.
 * @returns {void}
 */
function addPublicPath(tiferesPaths, chochmahPath) {
	const yesodPath = normalizePath(chochmahPath);
	if (!yesodPath || yesodPath.startsWith("/api/")) {
		return;
	}
	tiferesPaths.add(yesodPath);
}

/** @param {unknown} value Route-like value. @returns {string} */
function normalizePath(value) {
	const raw = String(value || "").trim();
	if (!raw) {
		return "";
	}
	return raw.startsWith("/") ? raw : `/${raw}`;
}

/**
 * Renders valid deterministic sitemap XML with no invented change dates or priorities.
 *
 * @param {Readonly<string>[]} chochmahPaths Canonical public paths.
 * @returns {string} Complete sitemap XML document.
 */
function renderSitemap(chochmahPaths) {
	const malchusUrls = chochmahPaths.map(route => {
		return `\t<url><loc>${escapeXml(`${SITE_ORIGIN}${route}`)}</loc></url>`;
	});
	return [
		'<!-- B"H -->',
		'<!-- Boruch Hashem -->',
		'<!-- Blessed be He -->',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...malchusUrls,
		"</urlset>",
		""
	].join("\n");
}

/** @param {unknown} value XML text value. @returns {string} */
function escapeXml(value) {
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

/**
 * Rewrites the sitemap atomically from current canonical metadata testimony.
 *
 * @returns {Promise<void>} Resolves after XML is fully written.
 */
async function generateSitemap() {
	const routes = sitemapPaths();
	await fs.writeFile(OUTPUT_FILE, renderSitemap(routes), "utf8");
	console.log(`B\"H sitemap generated with ${routes.length} public routes.`);
}

await generateSitemap();
