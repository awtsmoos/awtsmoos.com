//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs").promises;
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const { parseStylesheetBundle } = require("../compactCss/bundleCodec.js");
const { compactHtmlStylesheets } = require("../static/HtmlCompactStylesheets.js");

/**
 * @file Proves served HTML collapses only safe contiguous local stylesheet runs.
 * @description The Awtsmoos joins neighboring garments into one ordered river;
 * Awtsmoos.com keeps external and semantic boundaries standing so faster delivery never changes the giver.
 */

async function fixture() {
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awts-html-css-"));
	const directory = path.join(root, "apps", "demo");
	const styles = path.join(directory, "styles");
	await fs.mkdir(styles, { recursive: true });
	const page = path.join(directory, "index.html");
	await fs.writeFile(page, "<!doctype html>", "utf8");
	for (const name of ["a.css", "b.css", "c.css", "d.css"]) {
		await fs.writeFile(path.join(styles, name), `.${name[0]} { order: 1; }\n`, "utf8");
	}
	return { root, page };
}

function stylesheetHrefs(html) {
	return [...html.matchAll(/<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["'][^>]*>/gi)]
		.map(match => match[1]);
}

test("contiguous local styles become one ordered bundle and remain idempotent", async () => {
	const { root, page } = await fixture();
	const input = [
		'<link rel="stylesheet" href="./styles/a.css?v=1">',
		'<link rel="stylesheet" href="./styles/b.css#tone">',
		'<link rel="stylesheet" href="./styles/c.css">'
	].join("\n");
	const output = compactHtmlStylesheets(input, { filePath: page, rootDir: root });
	const hrefs = stylesheetHrefs(output);
	assert.equal(hrefs.length, 1);
	const url = new URL(hrefs[0], "https://example.invalid");
	assert.equal(url.searchParams.get("compact"), "true");
	assert.deepEqual(parseStylesheetBundle(url.searchParams.get("bundle")), [
		"/apps/demo/styles/a.css?v=1",
		"/apps/demo/styles/b.css#tone",
		"/apps/demo/styles/c.css"
	]);
	assert.equal(compactHtmlStylesheets(output, { filePath: page, rootDir: root }), output);
});

test("external and semantic links split runs without changing their attributes", async () => {
	const { root, page } = await fixture();
	const input = [
		'<link rel="stylesheet" href="./styles/a.css">',
		'<link rel="stylesheet" href="./styles/b.css">',
		'<link rel="stylesheet" href="https://cdn.example/theme.css">',
		'<link rel="stylesheet" href="./styles/c.css">',
		'<link rel="stylesheet" href="./styles/d.css" media="print">'
	].join("\n");
	const output = compactHtmlStylesheets(input, { filePath: page, rootDir: root });
	const hrefs = stylesheetHrefs(output);
	assert.equal(hrefs.length, 4);
	assert.match(hrefs[0], /bundle=/);
	assert.equal(hrefs[1], "https://cdn.example/theme.css");
	assert.match(hrefs[2], /\/apps\/demo\/styles\/c\.css\?compact=true/);
	assert.equal(hrefs[3], "./styles/d.css");
	assert.match(output, /media="print"/);
});
