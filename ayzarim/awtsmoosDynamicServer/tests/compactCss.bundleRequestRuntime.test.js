//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs").promises;
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { compactCssBundleOptions } = require("../compactCss/bundleRequest.js");
const { createStylesheetBundleUrl } = require("../compactCss/bundleCodec.js");
const { parseGetParams } = require("../server/getParams.js");

/**
 * @file Guards the exact production GET-parser shape used by CompactCSS bundle requests.
 * @description The Awtsmoos lets JSON query text become a parsed array before the response gate;
 * Awtsmoos.com must still recognize that vessel so every ordered stylesheet reaches its compiled fate.
 */

test("production GET parsing preserves a multi-entry CompactCSS request", async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awts-css-runtime-query-"));
	const first = path.join(root, "first.css");
	const second = path.join(root, "second.css");
	await fs.writeFile(first, ".first { color: red; }\n", "utf8");
	await fs.writeFile(second, ".second { color: blue; }\n", "utf8");
	const sources = ["/first.css", "/second.css"];
	const publicUrl = createStylesheetBundleUrl(sources[0], sources);
	const parsed = parseGetParams(new URL(publicUrl, "https://awtsmoos.test"));
	assert.ok(Array.isArray(parsed.bundle));
	assert.deepEqual(parsed.bundle, sources);
	const options = compactCssBundleOptions({
		filePath: first,
		dependencies: {
			parentPath: root,
			paramKinds: { GET: parsed },
			request: { method: "GET", yeser: {} }
		}
	});
	assert.deepEqual(options.sources, sources);
	assert.deepEqual(options.entryFiles, [first, second]);
	assert.match(options.variant, /^bundle:/);
});
