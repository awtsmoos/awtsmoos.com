// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file moduleUrlTransform.test.cjs
 * @description
 * Proves CompactJS preserves browser-valid absolute module identity for native
 * `import.meta.url` consumers and relative asset resolution.
 *
 * RESPONSIBILITY:
 * Verify runtime URL expression semantics, source rewriting, and canonical
 * public pathname derivation without depending on a generated Mitzvah bundle.
 *
 * NON-RESPONSIBILITY:
 * This test does not compile a full module graph, launch Chrome, or verify
 * dynamic-import representation routing; those integration gates follow later.
 *
 * The Awtsmoos is beyond every path and origin while finite tests need one
 * measurable witness. Awtsmoos.com lets Yesod prove the URL vessel before the
 * living browser carries that same light into a complete world and story.
 */

const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");
const {
	browserUrlForRecord,
	rewriteImportMetaUrl,
	runtimeBrowserUrlExpression
} = require("./moduleUrlTransform.js");

const BROWSER_HREF = "http://127.0.0.1:8766/geelooy/games/demo/index.html";
const MODULE_PATH = "/games/example/module.js";

test("B'H runtime URL expression yields an absolute source-module URL", () => {
	const expression = runtimeBrowserUrlExpression(MODULE_PATH);
	const result = evaluateRuntimeExpression(expression, BROWSER_HREF);
	assert.equal(
		result,
		"http://127.0.0.1:8766/games/example/module.js"
	);
});

test("B'H rewritten import.meta.url preserves relative asset resolution", () => {
	const source = [
		"return {",
		"own: new URL(import.meta.url).href,",
		"asset: new URL('./leaf.png', import.meta.url).href",
		"};"
	].join("\n");
	const rewritten = rewriteImportMetaUrl(source, MODULE_PATH);
	const result = evaluateRuntimeBody(rewritten, BROWSER_HREF);
	assert.equal(
		result.own,
		"http://127.0.0.1:8766/games/example/module.js"
	);
	assert.equal(
		result.asset,
		"http://127.0.0.1:8766/games/example/leaf.png"
	);
	assert.doesNotMatch(rewritten, /new URL\("\/games\/example\/module\.js"\)/);
});

test("B'H public module path derives from the real source resource", () => {
	const rootDir = path.join(path.sep, "repo", "geelooy");
	const filePath = path.join(
		rootDir,
		"games",
		"example",
		"module.js"
	);
	assert.equal(
		browserUrlForRecord({ rootDir }, { filePath }),
		"/games/example/module.js"
	);
});

/** Evaluates one generated expression against an isolated browser location. */
function evaluateRuntimeExpression(expression, href) {
	const evaluator = Function(
		"URL",
		"globalThis",
		`return ${expression};`
	);
	return evaluator(URL, runtimeGlobal(href));
}

/** Evaluates one rewritten module-body fixture against browser-like globals. */
function evaluateRuntimeBody(source, href) {
	const evaluator = Function(
		"URL",
		"globalThis",
		source
	);
	return evaluator(URL, runtimeGlobal(href));
}

/** Creates the smallest browser-location vessel required by generated code. */
function runtimeGlobal(href) {
	return {
		location: {
			href
		}
	};
}
