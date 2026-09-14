//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs").promises;
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { parseStylesheetBundle } = require("../compactCss/bundleCodec.js");
const { MAX_BUNDLE_SOURCES, compactHtmlStylesheets } = require("../static/HtmlCompactStylesheets.js");

/**
 * @file htmlCompactStylesheetBounds.test.js
 * @description Proves large local design systems become multiple bounded stylesheet
 * requests while preserving exact cascade order and keeping small runs compact.
 */

test("large stylesheet runs split into bounded ordered requests", async () => {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awts-css-bound-"));
	const directory = path.join(root, "drive");
	const styles = path.join(directory, "styles");
	await fs.mkdir(styles, { recursive: true });
	const page = path.join(directory, "index.html");
	await fs.writeFile(page, "<!doctype html>", "utf8");
	const names = Array.from({ length: 19 }, (_, index) => `s${index}.css`);
	for (const name of names) {
		await fs.writeFile(path.join(styles, name), `.${name[1]} { display: block; }\n`, "utf8");
	}
	const source = names.map(name => `<link rel="stylesheet" href="./styles/${name}">`).join("\n");
	const output = compactHtmlStylesheets(source, { filePath: page, rootDir: root });
	const hrefs = [...output.matchAll(/href=["']([^"']+)["']/g)].map(match => match[1]);
	assert.equal(hrefs.length, Math.ceil(names.length / MAX_BUNDLE_SOURCES));
	const recovered = hrefs.flatMap(href => sourcesFromHref(href));
	assert.deepEqual(recovered, names.map(name => `/drive/styles/${name}`));
	assert.ok(hrefs.every(href => href.length < 1600));
	await fs.rm(root, { recursive: true, force: true });
});

/** @param {string} href Compacted stylesheet href. @returns {string[]} Original source identities. */
function sourcesFromHref(href) {
	const url = new URL(href, "https://example.invalid");
	const bundle = url.searchParams.get("bundle");
	return bundle ? parseStylesheetBundle(bundle) : [url.pathname];
}
