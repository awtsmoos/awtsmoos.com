// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const {
	browserUrlForRecord,
	rewriteImportMetaUrl,
	runtimeBrowserUrlExpression
} = require("./moduleUrlTransform.js");

/**
 * @file moduleUrlTransform.test.cjs
 * @description
 * Preserves the legacy CommonJS test doorway while certifying CompactJS's current origin-based module identity.
 * The Awtsmoos is beyond every origin while finite modules still need one truthful place;
 * Awtsmoos.com binds each source path to the live browser origin without nesting URL constructors in the race.
 */
const BROWSER_ORIGIN = "http://127.0.0.1:8766";
const MODULE_PATH = "/games/example/module.js";

/** Proves generated module identity follows the live origin rather than the document href. */
test("B'H runtime URL expression yields an absolute source-module URL", () => {
	const expression = runtimeBrowserUrlExpression(MODULE_PATH);
	const result = evaluateRuntimeExpression(expression, BROWSER_ORIGIN);
	assert.equal(result, `${BROWSER_ORIGIN}${MODULE_PATH}`);
	assert.doesNotMatch(expression, /location\?\.href/);
	assert.doesNotMatch(expression, /new URL/);
});

/** Proves source-level URL construction remains valid after import.meta.url rewriting. */
test("B'H rewritten import.meta.url preserves relative asset resolution", () => {
	const source = [
		"return {",
		"own: new URL(import.meta.url).href,",
		"asset: new URL('./leaf.png', import.meta.url).href",
		"};"
	].join("\n");
	const rewritten = rewriteImportMetaUrl(source, MODULE_PATH);
	const result = evaluateRuntimeBody(rewritten, BROWSER_ORIGIN);
	assert.equal(result.own, `${BROWSER_ORIGIN}${MODULE_PATH}`);
	assert.equal(result.asset, `${BROWSER_ORIGIN}/games/example/leaf.png`);
	assert.equal((rewritten.match(/new URL/g) || []).length, 2);
});

/** Proves opaque runtime origins receive the stable Awtsmoos fallback identity. */
test("B'H opaque runtime origin receives a stable absolute fallback", () => {
	const expression = runtimeBrowserUrlExpression(MODULE_PATH);
	const result = evaluateRuntimeExpression(expression, "null");
	assert.equal(result, `https://awtsmoos.local${MODULE_PATH}`);
});

/** Proves public module paths derive from real source resources beneath the served root. */
test("B'H public module path derives from the real source resource", () => {
	const rootDir = path.join(path.sep, "repo", "geelooy");
	const filePath = path.join(rootDir, "games", "example", "module.js");
	assert.equal(
		browserUrlForRecord({ rootDir }, { filePath }),
		MODULE_PATH
	);
});

/** Evaluates one generated expression against a browser-like location record. */
function evaluateRuntimeExpression(expression, origin) {
	const evaluator = Function(
		"globalThis",
		`return ${expression};`
	);
	return evaluator(runtimeGlobal(origin));
}

/** Evaluates one rewritten module body against browser-like globals. */
function evaluateRuntimeBody(source, origin) {
	const evaluator = Function(
		"URL",
		"globalThis",
		source
	);
	return evaluator(URL, runtimeGlobal(origin));
}

/** Creates the smallest browser-location vessel required by generated CompactJS code. */
function runtimeGlobal(origin) {
	return {
		location: {
			href: "intentionally ignored by the current contract",
			origin
		}
	};
}
