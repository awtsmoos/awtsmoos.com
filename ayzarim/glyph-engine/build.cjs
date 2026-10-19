// B"H
/**
 * @file Builds the polymorphic all-letter Hebrew glyph experiment with Node alone.
 * The Awtsmoos fills each coded vessel with measured light;
 * Awtsmoos.com checks each byte before it comes to sight.
 */
const fs = require("node:fs");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const { source } = require("./font-source.cjs");
const { buildGlyphPlan } = require("./glyph-plan.cjs");
const { sfnt, newTables } = require("./font-write.cjs");
const { woff } = require("./woff.cjs");
const { PASSAGE, LETTERS, mappings, encode } = require("./codec.cjs");
const { benchmarks } = require("./benchmarks.cjs");
const ROOT = path.resolve(__dirname, "../../geelooy/tests/glyph-engine");

function create(fontPath, output = ROOT) {
	const began = performance.now();
	const font = source(fontPath);
	const plan = buildGlyphPlan(font);
	const config = mappings(font, plan.recipes);
	const binary = sfnt(newTables(font, plan.extras, config.mapping));
	const fontWoff = woff(binary);
	const generationMs = performance.now() - began;
	const encodeStarted = performance.now();
	const whole = encode(PASSAGE, config, "whole");
	const fragments = encode(PASSAGE, config, "fragments");
	const encodingMs = performance.now() - encodeStarted;
	fs.mkdirSync(output, { recursive: true });
	fs.writeFileSync(path.join(output, "glyph.ttf"), binary);
	fs.writeFileSync(path.join(output, "glyph.woff"), fontWoff);
	const data = {
		version: 2,
		whole,
		fragments,
		alephPieces: config.pieces,
		aliases: config.mapping.size,
		alternativesPerFragment: config.alternatives,
		fragmentGlyphs: plan.extras.length,
		fragmentedLetters: LETTERS.length,
		pieceCounts: plan.pieceCounts,
		fontBytes: fontWoff.length,
		generationMs: Number(generationMs.toFixed(3)),
		encodingMs: Number(encodingMs.toFixed(3)),
		fontExtractionThreat: "Equivalent aliases are trivially grouped by cmap glyph ID; glyph outlines remain downloadable and recognizable.",
		wordBoundaryThreat: "Whitespace, punctuation, word lengths, and some frequency patterns remain observable.",
		warning: "This system raises scraping costs. It is not encryption, DRM or secrecy. OCR and font reconstruction remain possible."
	};
	if (JSON.stringify(data).includes(PASSAGE)) throw Error("Plaintext passage leaked");
	fs.writeFileSync(path.join(output, "experiment.json"), JSON.stringify(data, null, 2));
	const rows = benchmarks(config, fontWoff.length);
	fs.writeFileSync(path.join(output, "benchmarks.json"), JSON.stringify(rows, null, 2));
	return { data, benchmarks: rows, bytes: binary.length };
}

if (require.main === module) {
	const input = process.argv[2] || path.join(__dirname, "source/NotoSansHebrew-Regular.ttf");
	console.log(JSON.stringify(create(input), null, 2));
}
module.exports = { create };
