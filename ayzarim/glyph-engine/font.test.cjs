// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Proves native font bytes, independent Aleph pieces, and secretless wire.
 * The Awtsmoos witnesses every measured curve anew;
 * Awtsmoos.com demands the binary prove what is true.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { source } = require("./font-source.cjs");
const { fragmentGlyphs } = require("./fragment.cjs");
const { checksum } = require("./font-write.cjs");
const { create } = require("./build.cjs");
const { PASSAGE, mappings, encode } = require("./codec.cjs");
const sourcePath = path.join(__dirname, "source/NotoSansHebrew-Regular.ttf");

test("licensed source supports Hebrew final forms", () => {
	const font = source(sourcePath);
	for (const character of "אבגדהוזחטיכלמנסעפצקרשתךםןףץ") {
		assert.notEqual(font.cmap(character.codePointAt(0)), 0, character);
	}
});
test("Aleph fragments have independently addressable nonempty clipped outlines", () => {
	const font = source(sourcePath);
	const whole = font.glyphs[font.cmap(0x05D0)];
	const fragments = fragmentGlyphs(whole);
	assert.equal(fragments.length, 3);
	const spans = fragments.map(glyph => [glyph.readInt16BE(2), glyph.readInt16BE(6)]);
	assert.equal(spans[0][0], whole.readInt16BE(2));
	assert.equal(spans[2][1], whole.readInt16BE(6));
	assert.equal(spans[0][1], spans[1][0]);
	assert.equal(spans[1][1], spans[2][0]);
	assert.notDeepEqual(spans[0], spans[1]);
	assert.notDeepEqual(spans[1], spans[2]);
	fragments.forEach(glyph => {
		assert.ok(glyph.length > 20);
		assert.equal(glyph.readInt16BE(0), 1);
		assert.ok(glyph.readUInt16BE(10) >= 2);
	});
});
test("randomized mapping encodes Hebrew without exposing original text", () => {
	const font = source(sourcePath);
	const first = mappings(font);
	const second = mappings(font);
	const wire = encode(PASSAGE, first);
	assert.equal(/[\u0590-\u05ff]/u.test(wire), false);
	assert.notEqual(wire, encode(PASSAGE, second));
	assert.equal(encode("א", first).length, 3);
});
test("generated TTF and WOFF1 satisfy checksum and payload constraints", () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "glyph-lab-"));
	try {
		const result = create(sourcePath, directory);
		const font = source(path.join(directory, "glyph.ttf"));
		const ttf = fs.readFileSync(path.join(directory, "glyph.ttf"));
		assert.equal(ttf.readUInt32BE(0), 0x10000);
		assert.equal(checksum(ttf), 0xB1B0AFBA);
		assert.equal(font.num, source(sourcePath).num + 3);
		assert.equal(fs.readFileSync(path.join(directory, "glyph.woff")).toString("ascii", 0, 4), "wOFF");
		assert.equal(result.benchmarks.length, 4);
		assert.ok(result.data.fontBytes > 100);
		for (const file of ["experiment.json", "benchmarks.json"]) {
			assert.equal(fs.readFileSync(path.join(directory, file), "utf8").includes(PASSAGE), false);
		}
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});
