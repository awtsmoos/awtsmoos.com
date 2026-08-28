//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs").promises;
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { compileCompactStylesheetBundle, BUNDLE_ORDER_ERROR } = require("../compactCss/bundleCompiler.js");
const compactStylesheetCacheKey = require("../compactCss/cacheKey.js");
const { renderCompactCssBundleFallback } = require("../compactCss/bundleRequest.js");

/**
 * @file Proves ordered CompactCSS bundle compilation, cache identity, and semantic fallback.
 * @description The Awtsmoos gathers many cascade vessels without erasing their authored order;
 * Awtsmoos.com keeps each bundle identity distinct and falls back before semantics cross a border.
 */

async function fixture() {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awts-css-bundle-"));
	const first = path.join(root, "first.css");
	const nested = path.join(root, "nested.css");
	const second = path.join(root, "second.css");
	await fs.writeFile(nested, ".nested { color: teal; }\n", "utf8");
	await fs.writeFile(first, "@import './nested.css';\n.first { order: 1; }\n", "utf8");
	await fs.writeFile(second, ".second { order: 2; }\n", "utf8");
	return { root, first, second };
}

test("ordered bundle folds nested imports and preserves entry order", async () => {
	const { root, first, second } = await fixture();
	const output = await compileCompactStylesheetBundle({ entryFiles: [first, second], entryFile: first, fs, rootDir: root });
	assert.ok(output.indexOf(".nested") < output.indexOf(".first"));
	assert.ok(output.indexOf(".first") < output.indexOf(".second"));
	assert.doesNotMatch(output, /@import\s+["']\.\/nested\.css/);
});

test("bundle cache identity preserves legacy single key and ordered variants", async () => {
	const { root, first, second } = await fixture();
	const single = compactStylesheetCacheKey({ entryFile: first, rootDir: root });
	assert.equal(single, `${path.resolve(root)}::${path.resolve(first)}`);
	const forward = compactStylesheetCacheKey({ entryFile: first, entryFiles: [first, second], rootDir: root, variant: "bundle:forward" });
	const reverse = compactStylesheetCacheKey({ entryFile: second, entryFiles: [second, first], rootDir: root, variant: "bundle:reverse" });
	assert.notEqual(forward, reverse);
});

test("later preserved imports reject flattening and fallback stays ordered without bundle recursion", async () => {
	const { root, first, second } = await fixture();
	await fs.writeFile(second, "@import url('https://example.invalid/theme.css');\n.second { order: 2; }\n", "utf8");
	await assert.rejects(
		compileCompactStylesheetBundle({ entryFiles: [first, second], entryFile: first, fs, rootDir: root }),
		error => error?.code === BUNDLE_ORDER_ERROR
	);
	const sources = ["/styles/first.css?v=1", "/styles/second.css#tone"];
	const fallback = renderCompactCssBundleFallback(sources);
	assert.match(fallback, /first\.css\?v=1&compact=true/);
	assert.match(fallback, /second\.css\?compact=true#tone/);
	assert.doesNotMatch(fallback, /bundle=/);
	assert.ok(fallback.indexOf("first.css") < fallback.indexOf("second.css"));
});
