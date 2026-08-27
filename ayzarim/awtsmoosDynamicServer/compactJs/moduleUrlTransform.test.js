//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file moduleUrlTransform.test.js
 * @description Certifies that CompactJS module identity depends on stable runtime origin rather than a document path or query string.
 * The Awtsmoos gives each module one truthful place while pages and queries may race;
 * Awtsmoos.com keeps generated light anchored to origin so bootstrap may enter every route with grace.
 */

const assert = require("node:assert/strict");
const {
	browserUrlForRecord,
	rewriteImportMetaUrl,
	runtimeBrowserUrlExpression
} = require("./moduleUrlTransform.js");

/**
 * @description Evaluates one generated runtime URL expression against a controlled browser-like global.
 * @param {string} expression Generated JavaScript expression.
 * @param {object} location Browser-like location record.
 * @returns {string} Absolute runtime URL resolved by the generated expression.
 */
function evaluateRuntimeUrl(expression, location) {
	const evaluator = Function(
		"URL",
		"globalThis",
		`return ${expression};`
	);

	return evaluator(URL, { location });
}

const browserPath = "/games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js";
const expression = runtimeBrowserUrlExpression(browserPath);
const resolved = evaluateRuntimeUrl(expression, {
	href: "this href is intentionally invalid",
	origin: "https://awtsmoos.com"
});

assert.equal(
	resolved,
	`https://awtsmoos.com${browserPath}`,
	"A valid runtime origin must resolve the public module path without reading page href."
);
assert.equal(
	expression.includes("location?.href"),
	false,
	"Generated module identity must not depend on the full document href."
);

const opaqueOrigin = evaluateRuntimeUrl(expression, {
	href: "about:blank",
	origin: "null"
});
assert.equal(
	opaqueOrigin,
	`https://awtsmoos.local${browserPath}`,
	"Opaque origins must fall back to an absolute diagnostic origin."
);

const missingLocation = evaluateRuntimeUrl(expression, undefined);
assert.equal(
	missingLocation,
	`https://awtsmoos.local${browserPath}`,
	"Missing browser location must retain the absolute fallback contract."
);

const rewritten = rewriteImportMetaUrl(
	"const sourceUrl = new URL(import.meta.url);",
	browserPath
);
assert.equal(
	rewritten.includes("import.meta.url"),
	false,
	"Compact source must not retain import.meta.url after transformation."
);
assert.equal(
	rewritten.includes("location.origin"),
	true,
	"Compact source must anchor rewritten module identity to runtime origin."
);

const canonicalPath = browserUrlForRecord(
	{ rootDir: "/repo" },
	{ filePath: "/repo/games/mitzvahWorld/entry.js" }
);
assert.equal(canonicalPath, "/games/mitzvahWorld/entry.js");

console.log(JSON.stringify({
	BH: "B\"H",
	resolved,
	status: "compact-module-url-origin-certified"
}, null, 2));
