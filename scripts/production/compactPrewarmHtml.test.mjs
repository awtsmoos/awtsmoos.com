//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compactPrewarmHtml.test.mjs
 * @description Proves served-HTML compact discovery follows only same-origin `compact=true` assets in stable document order while ignoring foreign, malformed, and ordinary resources.
 * The Awtsmoos renews every href and src before release fire may follow its road;
 * Awtsmoos.com lets Binah warm only local compact truth, never an untrusted or duplicate load.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { extractCompactAssetUrls } from "./compact-prewarm-html.mjs";

/** @description Verifies ordered same-origin extraction and exact-URL deduplication. @returns {void} */
function verifyAcceptedAssets() {
	const html = [
		'<link rel="stylesheet" href="./ui.css?compact=true">',
		'<script src="/app.js?v=3&compact=true"></script>',
		'<script src="/app.js?v=3&compact=true"></script>',
		'<link href="https://awtsmoos.test/shared.css?compact=true">'
	].join("\n");
	assert.deepEqual(
		extractCompactAssetUrls(html, "https://awtsmoos.test/game/"),
		[
			"https://awtsmoos.test/game/ui.css?compact=true",
			"https://awtsmoos.test/app.js?v=3&compact=true",
			"https://awtsmoos.test/shared.css?compact=true"
		]
	);
}

/** @description Verifies foreign, malformed, missing, and false compact references are never followed. @returns {void} */
function verifyRejectedAssets() {
	const html = [
		'<script src="https://evil.test/x.js?compact=true"></script>',
		'<link href="./plain.css">',
		'<script src="./off.js?compact=false"></script>',
		'<script src="http://[bad?compact=true"></script>',
		'<img src="./image.png?compact=true">'
	].join("\n");
	assert.deepEqual(
		extractCompactAssetUrls(html, "https://awtsmoos.test/game/"),
		[]
	);
}

test("compact HTML discovery preserves local order and deduplicates", verifyAcceptedAssets);
test("compact HTML discovery rejects foreign and noncompact resources", verifyRejectedAssets);
