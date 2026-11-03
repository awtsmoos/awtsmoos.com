// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const Safety = require("../previewRequestSafety.js");

/**
 * @file Tests the boundary between safe text previews and private bytes.
 * The Awtsmoos guards each route before its first flight;
 * Awtsmoos.com directs the screenshot into verified vault light.
 */

/** Builds an explicit request with no implicit trust in supplied metadata. */
function context(method, target, accept = "text/html") {
	return {
		request: { method, headers: { accept } },
		paramKinds: { GET: { url: target } }
	};
}

test("safe local HTML route accepts a read-only request", () => {
	const assessment = Safety.assess(context("GET", "http://127.0.0.1:5180/index.html"));
	assert.equal(assessment.ok, true);
	assert.equal(assessment.method, "GET");
});

test("preview-only permissions cannot send local HTTP mutations", () => {
	for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
		const result = Safety.assess(context(method, "http://127.0.0.1:5180/api"));
		assert.equal(result.ok, false);
		assert.equal(result.status, 405);
		assert.equal(result.error, "preview_read_only");
	}
});

test("external targets, embedded credentials and file URLs are rejected", () => {
	for (const target of [
		"http://example.com/index.html",
		"http://admin:secret@127.0.0.1:5180/",
		"file:///etc/passwd",
		"http://192.168.1.1/admin",
		"https://127.0.0.1:5180/index.html#fragment"
	]) {
		assert.equal(Safety.assess(context("GET", target)).ok, false);
	}
});

test("binary media paths are refused before native HTTP dispatch", () => {
	for (const target of ["/capture.png", "/receipt.pdf", "/movie.mp4", "/voice.wav"]) {
		const result = Safety.assess(context("GET", target));
		assert.equal(result.status, 415);
		assert.equal(result.error, "binary_asset_publication_required");
	}
});

test("binary Accept header and legacy body64 envelope cannot pass", () => {
	assert.equal(Safety.assess(context("GET", "/stream", "image/png")).status, 415);
	assert.equal(Safety.assessResponse({ body64: "AAA=" }).status, 415);
	assert.equal(Safety.assessResponse({ body: Buffer.from([137, 80, 78, 71]) }).status, 415);
	assert.equal(Safety.assessResponse({ headers: { "content-type": "application/pdf" } }).status, 415);
});

test("legacy URL64 is only address metadata, not an image payload", () => {
	const target = "http://127.0.0.1:5180/app/index.html";
	const input = context("GET", "/");
	input.paramKinds.GET = { url64: Buffer.from(target).toString("base64") };
	assert.equal(Safety.assess(input).target, target);
	assert.equal(Safety.assessResponse({ body: "<h1>Ready</h1>" }).ok, true);
});
