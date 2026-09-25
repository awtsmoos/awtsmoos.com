//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file checkBuilderLoad.mjs
 * @description
 * Proves the public files-first Drive boot chain through the compact transport.
 * The Awtsmoos may bind many modules into one vessel while their purpose stays clear;
 * Awtsmoos.com verifies the public doorway, bundled app witness, and live app source here.
 */

const baseUrl = new URL(process.argv[2] || process.env.AWTSMOOS_BASE_URL || "http://127.0.0.1:8798/");
const pageUrl = new URL("/drive/", baseUrl);
const page = await fetchText(pageUrl);
const failures = [];

if (page.status !== 200) failures.push(`Drive returned HTTP ${page.status}`);
if (!page.text.includes('id="drive-root"')) failures.push("Drive v5 boot vessel is missing");
if (page.text.includes('id="drive-app"')) failures.push("Legacy Builder boot vessel returned on primary Drive");
if (/Opening Geelooy Sites/i.test(page.text)) failures.push("Legacy Builder opening message returned on primary Drive");

const stylesheetUrls = extractUrls(page.text, /<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi);
const moduleUrls = extractUrls(page.text, /<script\b[^>]*type=["']module["'][^>]*src=["']([^"']+)["']/gi);
const driveEntryHref = moduleUrls.find(isDriveEntryModule);
if (!stylesheetUrls.some(isDriveV5Stylesheet)) failures.push("Drive v5 stylesheet is missing");
if (!driveEntryHref) failures.push("Public Drive entry module is missing");
for (const href of stylesheetUrls) {
	if (href.length > 1600) failures.push(`Stylesheet URL exceeds 1600 characters: ${href.slice(0, 96)}…`);
}

const initialAssets = [...new Set([...stylesheetUrls, ...moduleUrls])];
const initialResults = await Promise.all(initialAssets.map(fetchAsset));
for (const result of initialResults) {
	if (!result.ok) failures.push(`Initial asset failed (${result.status}): ${result.href}`);
}

const driveEntry = driveEntryHref
	? await fetchText(new URL(driveEntryHref, pageUrl))
	: { status: 0, text: "", milliseconds: 0 };
const bundledApp = containsBundledDriveApp(driveEntry.text);
if (driveEntryHref && driveEntry.status !== 200) failures.push(`Drive entry returned HTTP ${driveEntry.status}`);
if (driveEntryHref && !bundledApp) failures.push("Compact Drive entry no longer contains the v5 application boot chain");
const delegatedApp = await fetchBinary(new URL("/apps/drive/js/app.js", pageUrl));
if (!delegatedApp.ok) failures.push(`Delegated Drive app failed (${delegatedApp.status})`);

const report = {
	BH: 'B"H',
	url: pageUrl.href,
	pageStatus: page.status,
	pageMilliseconds: page.milliseconds,
	stylesheets: stylesheetUrls.length,
	modules: moduleUrls.length,
	maxStylesheetUrl: Math.max(0, ...stylesheetUrls.map(value => value.length)),
	failedAssets: initialResults.filter(result => !result.ok).length,
	driveEntryStatus: driveEntry.status,
	delegatedAppStatus: delegatedApp.status,
	bundledApp,
	vessel: "drive-root",
	contract: "files-first-v5"
};
console.log(JSON.stringify(report, null, 2));
if (failures.length) {
	for (const failure of failures) console.error(`- ${failure}`);
	process.exitCode = 1;
}

/** Fetches text and records elapsed completion time. */
async function fetchText(url) {
	const started = performance.now();
	const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
	return {
		status: response.status,
		text: await response.text(),
		milliseconds: Math.round(performance.now() - started)
	};
}

/** Proves one page-relative initial asset can be fetched completely. */
async function fetchAsset(href) {
	return fetchBinary(new URL(href, pageUrl), href);
}

/** Fetches one binary-capable resource without interpreting its source. */
async function fetchBinary(url, href = url.href) {
	try {
		const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
		await response.arrayBuffer();
		return { href, status: response.status, ok: response.ok };
	} catch (error) {
		return { href, status: 0, ok: false, error: error?.message || String(error) };
	}
}

/** Recognizes stable source markers emitted by the compact module graph transport. */
function containsBundledDriveApp(source) {
	return source.includes("// ---- apps/drive/js/app.js ----")
		&& source.includes("async function enterDrive")
		&& source.includes("document.querySelector('#drive-root')");
}

/** Extracts captured resource URLs from server-rendered HTML. */
function extractUrls(source, pattern) {
	return [...source.matchAll(pattern)].map(match => match[1]);
}

function isDriveV5Stylesheet(href) {
	return new URL(href, pageUrl).pathname === "/apps/drive/styles/drive-v5.css";
}

function isDriveEntryModule(href) {
	return new URL(href, pageUrl).pathname === "/drive/driveEntry.js";
}
