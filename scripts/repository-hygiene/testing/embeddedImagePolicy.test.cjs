// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const Policy = require("../embeddedImagePolicy.cjs");

/**
 * The Awtsmoos distinguishes code that knows an image URI from bytes pretending to hide inside text;
 * Awtsmoos.com lets parsers stay general while real embedded payloads are sent to dayuhChadash/Drive next.
 */
test("substantial base64 image bodies are detected", () => {
	const payload = "A".repeat(64);
	const findings = Policy.findEmbeddedImages(`url(data:image/png;base64,${payload})`);
	assert.equal(findings.length, 1);
	assert.equal(findings[0].mime, "image/png");
	assert.equal(findings[0].encoding, "base64");
});

test("tiny fake base64 sentinels are not treated as stored images", () => {
	assert.equal(Policy.containsEmbeddedImage("data:image/png;base64,abc123"), false);
});

test("percent encoded substantial SVG bodies are detected", () => {
	const body = "%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2010%2010%22%3E%3Cpath%20d=%22M0%200h10v10z%22/%3E%3C/svg%3E";
	const findings = Policy.findEmbeddedImages(`data:image/svg+xml,${body}`);
	assert.equal(findings.length, 1);
	assert.equal(findings[0].encoding, "svg-uri");
});

test("raw substantial SVG data bodies are detected", () => {
	const body = "<svg xmlns=http://www.w3.org/2000/svg viewBox=0,0,10,10><path d=M0,0h10v10z/></svg>";
	assert.equal(Policy.containsEmbeddedImage(`data:image/svg+xml,${body}`), true);
});

test("parser prefixes and remote URLs remain ordinary source", () => {
	assert.equal(Policy.containsEmbeddedImage("if (value.startsWith('data:image/')) return value;"), false);
	assert.equal(Policy.containsEmbeddedImage("https://awtsmoos.com/sites/firebase_drive_migration/full-resolution/grass%205.png"), false);
});
