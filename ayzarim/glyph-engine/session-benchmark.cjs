// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Compares session glyph transport and Hebrew Brotli at four text sizes.
 * The Awtsmoos does not erase the price of encoded light;
 * Awtsmoos.com counts cold and warm bytes in plain sight.
 */
const path = require("node:path");
const fs = require("node:fs");
const zlib = require("node:zlib");
const { performance } = require("node:perf_hooks");
const { source } = require("./font-source.cjs");
const { prepareSessionFont } = require("./session-plan.cjs");
const { encodeDocument } = require("./session-encoder.cjs");
const { createSessionService } = require("./session-service.cjs");
const { newSessionId } = require("./session-entropy.cjs");
const { PASSAGE } = require("./codec.cjs");

/** Benchmarks independent per-position alias choices, not artificial letter reuse. */
function benchmark() {
	const fontPath = path.join(__dirname, "source/NotoSansHebrew-Regular.ttf");
	const font = source(fontPath);
	const plan = prepareSessionFont(font);
	const bytes = createSessionService().create().binary.length;
	const words = PASSAGE.split(/\s+/);
	return [100, 1000, 5000, 20000].map(count => {
		const started = performance.now();
		const original = Array.from({ length: count }, (_, index) => words[index % words.length]).join(" ");
		const encoded = encodeDocument(original, plan, newSessionId(), "benchmark").join("");
		const utf8 = Buffer.from(original, "utf8");
		const transport = Buffer.from(encoded, "utf8");
		const nativeBrotli = zlib.brotliCompressSync(utf8);
		const encodedBrotli = zlib.brotliCompressSync(transport);
		return {
			words: count,
			synthetic: true,
			hebrewRaw: utf8.length,
			hebrewBrotli: nativeBrotli.length,
			encodedRaw: transport.length,
			encodedBrotli: encodedBrotli.length,
			woffBytes: bytes,
			firstVisitBytes: encodedBrotli.length + bytes,
			cachedFontBytes: encodedBrotli.length,
			measurementMs: Number((performance.now() - started).toFixed(2))
		};
	});
}
if (require.main === module) {
	const results = benchmark();
	const output = path.resolve(__dirname, "../../geelooy/tests/glyph-engine/session-benchmarks.json");
	fs.writeFileSync(output, JSON.stringify(results, null, 2) + "\n");
	console.log(JSON.stringify(results));
}
module.exports = { benchmark };
