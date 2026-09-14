//B"H
//Boruch Hashem
//Blessed be He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const test = require("node:test");
const { TrueTypeFont } = require("../../standards/fonts/TrueTypeFont.js");

const FONT = "/System/Library/Fonts/Supplemental/Arial Unicode.ttf";

test("from-scratch SFNT reader maps Latin and Hebrew glyphs", () => {
	const bytes = fs.readFileSync(FONT);
	const font = new TrueTypeFont(bytes);
	const latin = font.glyphId("A".codePointAt(0));
	const hebrew = font.glyphId("א".codePointAt(0));
	assert(latin > 0);
	assert(hebrew > 0);
	assert(font.advanceWidth(latin) > 0);
	assert(font.advanceWidth(hebrew) > 0);
	assert(font.metrics.unitsPerEm > 0);
});

test("from-scratch font measurement uses cmap and hmtx design units", () => {
	const font = new TrueTypeFont(fs.readFileSync(FONT));
	const measurement = font.measureCodePoints("שלום Awtsmoos", 20);
	assert.equal(measurement.glyphs.length, Array.from("שלום Awtsmoos").length);
	assert(measurement.designWidth > 0);
	assert(measurement.width > 0);
	assert(measurement.glyphs.some(item => item.codePoint > 0x590));
});
