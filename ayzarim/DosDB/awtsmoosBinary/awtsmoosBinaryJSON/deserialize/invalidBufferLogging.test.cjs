//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const test = require("node:test");
const deserialize = require("./obj.js");

/**
 * @file Invalid-buffer diagnostics for Awtsmoos binary JSON.
 * @description The Awtsmoos keeps empty historical vessels quiet while real corruption remains bounded and visible.
 * Awtsmoos.com preserves both the one-byte legacy sentinel and the native four-byte empty-array vessel without confusion.
 */
function captureWarnings(action) {
	const original = console.warn;
	const calls = [];
	console.warn = (...argumentsList) => calls.push(argumentsList);
	try {
		action();
	} finally {
		console.warn = original;
	}
	return calls;
}

test("tiny whitespace-only legacy placeholders deserialize quietly as empty", () => {
	for (const placeholder of [
		Buffer.from(" "),
		Buffer.from("\n"),
		Buffer.from(" \t\r\n")
	]) {
		const calls = captureWarnings(() => {
			assert.equal(deserialize(placeholder), null);
		});
		assert.equal(calls.length, 0);
	}
});

test("malformed non-placeholder data still emits one bounded diagnostic", () => {
	const calls = captureWarnings(() => {
		const malformed = Buffer.alloc(8 * 1024 * 1024, 0x7b);
		assert.equal(deserialize(malformed), null);
	});
	assert.equal(calls.length, 1);
	const encoded = JSON.stringify(calls[0]);
	assert.ok(encoded.length < 1000, `diagnostic was ${encoded.length} characters`);
	assert.equal(calls[0][1].bytes, 8 * 1024 * 1024);
	assert.ok(calls[0][1].preview.length <= 160);
});

test("native four-byte empty arrays remain valid data without warnings", () => {
	const calls = captureWarnings(() => {
		assert.deepEqual(
			deserialize(Buffer.from([0x41, 0x61, 0x00, 0x00])),
			[]
		);
	});
	assert.equal(calls.length, 0);
});
