//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Preview safety tests for Geelooy Drive.
 * @description
 * The Awtsmoos renews source and reflection while Awtsmoos.com proves the mirror cannot inherit the Drive's privileged home.
 * Markdown raw HTML is escaped, and HTML previews receive a script-capable but same-origin-denied sandbox alone.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	escapePreviewHtml,
	prepareDocumentPreview,
	renderSafeMarkdown
} from "../services/previewService.js";

test("escapes raw HTML before Markdown rendering", () => {
	const preview = renderSafeMarkdown("# Hello\n<script>alert(1)</script>");
	assert.match(preview, /<h1>Hello<\/h1>/);
	assert.match(preview, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
	assert.doesNotMatch(preview, /<script>alert\(1\)<\/script>/);
});

test("prepares HTML with scripts allowed but without same-origin access", () => {
	const preview = prepareDocumentPreview({
		content: "<script>document.body.textContent='ok'</script>",
		kind: { preview: "html" }
	});
	assert.equal(preview.sandbox, "allow-scripts");
	assert.doesNotMatch(preview.sandbox, /allow-same-origin/);
});

test("prepares Markdown in a scriptless sandbox", () => {
	const preview = prepareDocumentPreview({
		content: "**Hello**",
		kind: { preview: "markdown" }
	});
	assert.equal(preview.sandbox, "");
	assert.match(preview.srcdoc, /<strong>Hello<\/strong>/);
});

test("returns no preview for ordinary source files", () => {
	assert.equal(prepareDocumentPreview({ content: "body {}", kind: { preview: null } }), null);
	assert.equal(escapePreviewHtml("<>&"), "&lt;&gt;&amp;");
});
