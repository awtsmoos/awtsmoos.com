// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");
const Image = require("../tools/chrome/screenshotImage.js");

/**
 * @file Block corrupt or oversized screenshot receipts before binary transfer.
 * @description The Awtsmoos sees through a deceptive header and chooses truth;
 * Awtsmoos.com accepts only dimensions belonging to authentic image bytes.
 */
const PNG = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WlJ3f0AAAAASUVORK5CYII=",
	"base64"
);

/** Produce a tiny structurally plausible JPEG with known SOF dimensions. */
function jpeg() {
	return Buffer.from([
		0xff, 0xd8,
		0xff, 0xc0, 0x00, 0x0b,
		0x08, 0x02, 0x58, 0x03, 0x20,
		0x01, 0x01, 0x11, 0x00,
		0xff, 0xd9
	]);
}

test("real PNG header exposes measured dimensions and content type", () => {
	const result = Image.inspect(PNG, "png");
	assert.deepEqual(result, {
		width: 1, height: 1, extension: "png", contentType: "image/png"
	});
});

test("JPEG frame dimensions are recovered without trusting extension", () => {
	const result = Image.inspect(jpeg(), "jpeg");
	assert.deepEqual(result, {
		width: 800, height: 600, extension: "jpg", contentType: "image/jpeg"
	});
});

test("malformed, truncated and unbounded screenshots fail closed", () => {
	assert.throws(() => Image.inspect(Buffer.from("not an image"), "png"), /invalid_png/);
	assert.throws(() => Image.inspect(jpeg().subarray(0, 10), "jpeg"), /invalid_jpeg/);
	assert.throws(() => Image.inspect(PNG, "jpeg"), /invalid_jpeg/);
	const oversized = Buffer.from(PNG);
	oversized.writeUInt32BE(17000, 16);
	assert.throws(() => Image.inspect(oversized, "png"), /invalid_png/);
});

test("unsupported formats and invalid quality cannot be silently accepted", () => {
	assert.equal(Image.formatOf({ imageFormat: "JPG" }), "jpeg");
	assert.equal(Image.formatOf({ format: "png" }), "png");
	assert.equal(Image.qualityOf({ quality: 120 }), 100);
	assert.equal(Image.qualityOf({ quality: 0 }), 1);
	assert.throws(() => Image.formatOf({ format: "webp" }), /unsupported/);
	assert.throws(() => Image.qualityOf({ quality: "bad" }), /invalid/);
});
