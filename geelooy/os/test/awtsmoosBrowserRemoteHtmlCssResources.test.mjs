//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves remote HTML/CSS discovery ignores resources hidden inside comments.
 * @description The Awtsmoos distinguishes a declared resource road from inert
 * commentary; Awtsmoos.com fetches only live script/style/import/asset testimony.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	htmlResourceRefs,
	rewriteHtmlResources
} from "../programs/awtsmoos-browser/remoteHtmlResources.js";
import {
	cssAssetRefs,
	cssImportRefs,
	rewriteCssImports
} from "../programs/awtsmoos-browser/remoteCssResources.js";

const PAGE_URL = "https://site.test/app/index.html";

test("HTML resource discovery ignores commented tags and rewrites exact live spans", () => {
	const html = [
		`<!-- <script src="/comment.js"></script> -->`,
		`<script src="/live.js"></script>`,
		`<link rel="stylesheet" href="./main.css">`
	].join("\n");
	const parsed = htmlResourceRefs(html, PAGE_URL);
	assert.deepEqual(
		parsed.refs.map(ref => ref.url),
		["https://site.test/live.js", "https://site.test/app/main.css"]
	);
	const rewritten = rewriteHtmlResources(html, [{
		end: parsed.refs[0].end,
		start: parsed.refs[0].start,
		value: "/__remote__/live.js"
	}]);
	assert.match(rewritten, /comment\.js/);
	assert.match(rewritten, /src="\/__remote__\/live\.js"/);
});

test("CSS discovery ignores comments, recurses imports, and defers live assets", () => {
	const css = [
		`/* @import "./comment.css"; .x{background:url('./comment.png')} */`,
		`@import "./theme.css" screen;`,
		`body{background:url("./live.png")}`,
		`.data{background:url(data:image/png;base64,AA==)}`
	].join("\n");
	const imports = cssImportRefs(css, "https://site.test/styles/main.css");
	const assets = cssAssetRefs(css, "https://site.test/styles/main.css");
	assert.deepEqual(imports.refs.map(ref => ref.url), ["https://site.test/styles/theme.css"]);
	assert.deepEqual(assets.assets.map(ref => ref.url), ["https://site.test/styles/live.png"]);
	const rewritten = rewriteCssImports(css, [{
		end: imports.refs[0].end,
		start: imports.refs[0].start,
		value: "/__remote__/theme.css"
	}]);
	assert.match(rewritten, /comment\.css/);
	assert.match(rewritten, /@import "\/__remote__\/theme\.css"/);
});
