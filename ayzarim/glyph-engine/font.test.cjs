// B"H
/**
 * @file Tests the actual fragment outlines and recoverability of alias ciphers.
 * The Awtsmoos reveals the truth beneath each veil;
 * Awtsmoos.com verifies the geometry before a tale.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { source } = require("./font-source.cjs");
const { fragmentGlyphs, pieceCount } = require("./fragment.cjs");
const { buildGlyphPlan } = require("./glyph-plan.cjs");
const { checksum } = require("./font-write.cjs");
const { create } = require("./build.cjs");
const { PASSAGE, LETTERS, mappings, encode } = require("./codec.cjs");
const { audit } = require("./attack-audit.cjs");
const input = path.join(__dirname, "source/NotoSansHebrew-Regular.ttf");
const sourceFont = source(input);

test("all 27 Hebrew letters and finals have original glyphs", () => {
	assert.equal(LETTERS.length, 27);
	for (const letter of LETTERS) assert.ok(sourceFont.cmap(letter.codePointAt(0)));
});
test("every Hebrew glyph has two to four distinct nonempty geometric fragments", () => {
	for (const letter of LETTERS) {
		const glyph = sourceFont.glyphs[sourceFont.cmap(letter.codePointAt(0))];
		const fragments = fragmentGlyphs(glyph, pieceCount(glyph, letter));
		assert.ok(fragments.length >= 2 && fragments.length <= 4, letter);
		fragments.forEach(part => {
			assert.ok(part.readInt16BE(0) > 0, letter);
			assert.ok(part.length >= 20, letter);
		});
		assert.equal(fragments[0].readInt16BE(2), glyph.readInt16BE(2), letter);
		assert.equal(fragments.at(-1).readInt16BE(6), glyph.readInt16BE(6), letter);
	}
});
test("four randomized BMP aliases per outline produce variable transport", () => {
	const plan = buildGlyphPlan(sourceFont);
	assert.equal(plan.recipes.size, 27);
	assert.equal(plan.extras.length, 78);
	const config = mappings(sourceFont, plan.recipes);
	assert.equal(config.alternatives, 4);
	assert.equal(config.mapping.size, 432);
	for (const letter of LETTERS) {
		for (const alternatives of config.fragments.get(letter)) {
			assert.equal(new Set(alternatives).size, 4);
			alternatives.forEach(code => assert.ok(code.codePointAt(0) >= 0xE000));
		}
	}
	const first = encode(PASSAGE, config);
	const second = encode(PASSAGE, config);
	assert.notEqual(first, second);
	assert.equal(/[\u0590-\u05ff]/u.test(first), false);
	assert.equal(encode("א", config).length, 3);
});
test("native built TTF and WOFF1 validate and expose a measurable reverse-engineering surface", () => {
	const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-glyph-v2-"));
	try {
		const result = create(input, directory);
		const buffer = fs.readFileSync(path.join(directory, "glyph.ttf"));
		const generated = source(path.join(directory, "glyph.ttf"));
		assert.equal(checksum(buffer), 0xB1B0AFBA);
		assert.equal(generated.num, sourceFont.num + 78);
		assert.equal(fs.readFileSync(path.join(directory, "glyph.woff")).toString("ascii", 0, 4), "wOFF");
		assert.equal(result.data.fragmentedLetters, 27);
		assert.equal(result.data.aliases, 432);
		assert.equal(result.benchmarks.length, 4);
		assert.equal(result.benchmarks[0].firstVisitFragments,
			result.benchmarks[0].fragmentsBrotli + result.data.fontBytes);
		assert.ok(result.benchmarks[0].fragmentsBrotli > result.benchmarks[0].hebrewBrotli);
		const attack = audit(path.join(directory, "glyph.ttf"), path.join(directory, "experiment.json"));
		assert.equal(attack.fontRecoverable, true);
		assert.ok(attack.aliasesThatShareGlyphId > 0);
		for (const filename of ["experiment.json", "benchmarks.json"]) {
			assert.equal(fs.readFileSync(path.join(directory, filename), "utf8").includes(PASSAGE), false);
		}
	} finally {
		fs.rmSync(directory, { recursive: true, force: true });
	}
});
