// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Builds a randomized font, encoded text, and synthetic transfer benchmarks.
 * The Awtsmoos gives each letter its hidden breath;
 * Awtsmoos.com measures every byte beneath.
 */
const fs = require("node:fs");
const path = require("node:path");
const { performance } = require("node:perf_hooks");
const zlib = require("node:zlib");
const { source } = require("./font-source.cjs");
const { fragmentGlyphs } = require("./fragment.cjs");
const { sfnt, newTables } = require("./font-write.cjs");
const { woff } = require("./woff.cjs");
const { PASSAGE, mappings, encode } = require("./codec.cjs");
const ROOT = path.resolve(__dirname, "../../geelooy/tests/glyph-engine");
function create(fontPath, output = ROOT) {
	const started = performance.now();
	const font = source(fontPath);
	const aleph = font.glyphs[font.cmap(0x05D0)];
	const fragments = fragmentGlyphs(aleph);
	if (fragments.some(glyph => glyph.length < 20)) throw Error("Invalid Aleph fragments");
	const config = mappings(font);
	const binary = sfnt(newTables(font, fragments, config.mapping));
	const fontWoff = woff(binary);
	const generationMs = performance.now() - started;
	const encodeStarted = performance.now();
	const whole = encode(PASSAGE, config, "whole");
	const split = encode(PASSAGE, config, "fragments");
	const encodingMs = performance.now() - encodeStarted;
	fs.mkdirSync(output, { recursive: true });
	fs.writeFileSync(path.join(output, "glyph.ttf"), binary);
	fs.writeFileSync(path.join(output, "glyph.woff"), fontWoff);
	const data = {
		whole,
		fragments: split,
		alephPieces: config.pieces,
		aliases: config.chars.size,
		fragmentGlyphs: 3,
		fontBytes: fontWoff.length,
		generationMs: Number(generationMs.toFixed(3)),
		encodingMs: Number(encodingMs.toFixed(3)),
		warning: "Obfuscation, not encryption. OCR and font analysis can recover displayed text."
	};
	if (JSON.stringify(data).includes(PASSAGE)) throw Error("Plaintext leaked");
	fs.writeFileSync(path.join(output, "experiment.json"), JSON.stringify(data, null, 2));
	const benchmarks = [];
	for (const target of [100, 1000, 5000, 20000]) {
		const words = PASSAGE.split(/\s+/);
		const repeated = Array.from({ length: target }, (_, index) => words[index % words.length]).join(" ");
		const text = Buffer.from(repeated);
		const beginCompression = performance.now();
		const brotli = zlib.brotliCompressSync(text);
		const wholeText = Buffer.from(encode(repeated, config, "whole"));
		const fragmentText = Buffer.from(encode(repeated, config, "fragments"));
		const wholeBr = zlib.brotliCompressSync(wholeText);
		const fragmentBr = zlib.brotliCompressSync(fragmentText);
		benchmarks.push({
			words: target,
			synthetic: true,
			hebrewRaw: text.length,
			hebrewGzip: zlib.gzipSync(text).length,
			hebrewBrotli: brotli.length,
			wholeRaw: wholeText.length,
			wholeBrotli: wholeBr.length,
			fragmentsRaw: fragmentText.length,
			fragmentsBrotli: fragmentBr.length,
			firstVisitWhole: wholeBr.length + fontWoff.length,
			firstVisitFragments: fragmentBr.length + fontWoff.length,
			cachedFontWhole: wholeBr.length,
			cachedFontFragments: fragmentBr.length,
			compressionMs: Number((performance.now() - beginCompression).toFixed(3))
		});
	}
	fs.writeFileSync(path.join(output, "benchmarks.json"), JSON.stringify(benchmarks, null, 2));
	return { data, benchmarks, bytes: binary.length };
}
if (require.main === module) {
	const input = process.argv[2] || path.join(__dirname, "source/NotoSansHebrew-Regular.ttf");
	console.log(JSON.stringify(create(input), null, 2));
}
module.exports = { create };
