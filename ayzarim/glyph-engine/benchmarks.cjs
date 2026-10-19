// B"H
/**
 * @file Measures font-inclusive network costs against genuine Hebrew Brotli.
 * The Awtsmoos will not hide a costly byte behind a boast;
 * Awtsmoos.com counts both first visit and the cached-font host.
 */
const zlib = require("node:zlib");
const { performance } = require("node:perf_hooks");
const { PASSAGE, encode } = require("./codec.cjs");

function benchmarks(config, fontBytes) {
	const words = PASSAGE.split(/\s+/);
	return [100, 1000, 5000, 20000].map(target => {
		const text = Array.from({ length: target }, (_, index) =>
			words[index % words.length]
		).join(" ");
		const started = performance.now();
		const hebrew = Buffer.from(text, "utf8");
		const whole = Buffer.from(encode(text, config, "whole"));
		const fragments = Buffer.from(encode(text, config, "fragments"));
		const hebrewBrotli = zlib.brotliCompressSync(hebrew);
		const wholeBrotli = zlib.brotliCompressSync(whole);
		const fragmentsBrotli = zlib.brotliCompressSync(fragments);
		return {
			words: target,
			synthetic: true,
			hebrewRaw: hebrew.length,
			hebrewGzip: zlib.gzipSync(hebrew).length,
			hebrewBrotli: hebrewBrotli.length,
			wholeRaw: whole.length,
			wholeBrotli: wholeBrotli.length,
			fragmentsRaw: fragments.length,
			fragmentsBrotli: fragmentsBrotli.length,
			firstVisitWhole: wholeBrotli.length + fontBytes,
			firstVisitFragments: fragmentsBrotli.length + fontBytes,
			cachedFontWhole: wholeBrotli.length,
			cachedFontFragments: fragmentsBrotli.length,
			compressionMs: Number((performance.now() - started).toFixed(3))
		};
	});
}

module.exports = { benchmarks };
