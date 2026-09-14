//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file checkBuilderLoad.mjs
 * @description
 * Performs a fast dependency-free release canary for Geelooy Sites. It proves the
 * boot shell and every initial stylesheet/module asset respond successfully, while
 * rejecting oversized transport URLs that can make browser startup fragile.
 */

const baseUrl = new URL(process.argv[2] || process.env.AWTSMOOS_BASE_URL || "http://127.0.0.1:8798/");
const pageUrl = new URL("/drive/", baseUrl);
const page = await fetchText(pageUrl);
const failures = [];

if (page.status !== 200) failures.push(`Builder returned HTTP ${page.status}`);
if (!page.text.includes('id="drive-app"')) failures.push("Builder boot vessel is missing");
if (!/Opening Geelooy Sites/i.test(page.text)) failures.push("Builder immediate boot message is missing");

const stylesheetUrls = extractUrls(page.text, /<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi);
const moduleUrls = extractUrls(page.text, /<script\b[^>]*type=["']module["'][^>]*src=["']([^"']+)["']/gi);
if (!stylesheetUrls.length) failures.push("Builder has no initial stylesheet request");
if (!moduleUrls.length) failures.push("Builder has no module bootstrap request");
for (const href of stylesheetUrls) {
	if (href.length > 1600) failures.push(`Stylesheet URL exceeds 1600 characters: ${href.slice(0, 96)}…`);
}

const assets = [...new Set([...stylesheetUrls, ...moduleUrls])];
const results = await Promise.all(assets.map(async href => {
	const url = new URL(href, pageUrl);
	try {
		const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
		await response.arrayBuffer();
		return { href, status: response.status, ok: response.ok };
	} catch (error) {
		return { href, status: 0, ok: false, error: error?.message || String(error) };
	}
}));
for (const result of results) {
	if (!result.ok) failures.push(`Initial asset failed (${result.status}): ${result.href}`);
}

const report = {
	BH: 'B"H',
	url: pageUrl.href,
	pageStatus: page.status,
	pageMilliseconds: page.milliseconds,
	stylesheets: stylesheetUrls.length,
	modules: moduleUrls.length,
	maxStylesheetUrl: Math.max(0, ...stylesheetUrls.map(value => value.length)),
	failedAssets: results.filter(result => !result.ok).length
};
console.log(JSON.stringify(report, null, 2));
if (failures.length) {
	for (const failure of failures) console.error(`- ${failure}`);
	process.exitCode = 1;
}

/** @param {URL} url Absolute URL. @returns {Promise<object>} Text, status, and elapsed time. */
async function fetchText(url) {
	const started = performance.now();
	const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
	return { status: response.status, text: await response.text(), milliseconds: Math.round(performance.now() - started) };
}

/** @param {string} source HTML source. @param {RegExp} pattern Global capture expression. @returns {string[]} */
function extractUrls(source, pattern) {
	return [...source.matchAll(pattern)].map(match => match[1]);
}
