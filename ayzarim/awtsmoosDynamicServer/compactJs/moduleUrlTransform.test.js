//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file moduleUrlTransform.test.js
 * @description Certifies that CompactJS lowers module identity to a plain absolute string before source code constructs URL objects.
 * The Awtsmoos gives each module one truthful place while pages and queries may race;
 * Awtsmoos.com keeps generated light free of nested URL construction so bootstrap enters every route with grace.
 */

const assert = require("node:assert/strict");
const {
	browserUrlForRecord,
	rewriteImportMetaUrl,
	runtimeBrowserUrlExpression
} = require("./moduleUrlTransform.js");

/**
 * @description Evaluates one generated module-identity expression against a controlled browser-like global.
 * @param {string} expression Generated JavaScript expression.
 * @param {object|undefined} location Browser-like location record.
 * @returns {string} Absolute runtime module URL string.
 */
function evaluateRuntimeExpression(expression, location) {
	const evaluator = Function(
		"globalThis",
		`return ${expression};`
	);

	return evaluator({ location });
}

/**
 * @description Evaluates the exact readable-source pattern that previously froze MitzvahWorld.
 * @param {string} source Rewritten compact source statement.
 * @param {object} location Browser-like location record.
 * @returns {string} URL href produced by source-level new URL(import.meta.url).
 */
function evaluateRewrittenSource(source, location) {
	const evaluator = Function(
		"URL",
		"globalThis",
		source
	);

	return evaluator(URL, { location });
}

const browserPath = "/games/mitzvahWorld/experiments/Awtsmoos/src/launcher/MinimalSharedMeadowPage.js";
const expectedUrl = `https://awtsmoos.com${browserPath}`;
const expression = runtimeBrowserUrlExpression(browserPath);

assert.equal(
	evaluateRuntimeExpression(expression, {
		href: "this href is intentionally invalid",
		origin: "https://awtsmoos.com"
	}),
	expectedUrl
);
assert.equal(
	expression.includes("new URL"),
	false,
	"Generated import.meta.url identity must not construct a nested URL object."
);
assert.equal(
	expression.includes("location?.href"),
	false,
	"Generated module identity must not depend on the document href."
);

const rewritten = rewriteImportMetaUrl(
	"return new URL(import.meta.url).href;",
	browserPath
);
assert.equal(
	evaluateRewrittenSource(rewritten, {
		href: "also intentionally invalid",
		origin: "https://awtsmoos.com"
	}),
	expectedUrl,
	"The exact MitzvahWorld source pattern must receive one absolute URL argument."
);
assert.equal(
	(rewritten.match(/new URL/g) || []).length,
	1,
	"The rewritten source must contain only the original source-level URL constructor."
);

assert.equal(
	evaluateRuntimeExpression(expression, { href: "about:blank", origin: "null" }),
	`https://awtsmoos.local${browserPath}`
);
assert.equal(
	evaluateRuntimeExpression(expression, undefined),
	`https://awtsmoos.local${browserPath}`
);

const canonicalPath = browserUrlForRecord(
	{ rootDir: "/repo" },
	{ filePath: "/repo/games/mitzvahWorld/entry.js" }
);
assert.equal(canonicalPath, "/games/mitzvahWorld/entry.js");

console.log(JSON.stringify({
	BH: "B\"H",
	expectedUrl,
	status: "compact-module-url-string-certified"
}, null, 2));
