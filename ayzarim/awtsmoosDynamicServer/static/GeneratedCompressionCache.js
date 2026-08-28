//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file GeneratedCompressionCache.js
 * @description Caches bounded Brotli and gzip vessels for exact generated response bytes while deduplicating simultaneous compression.
 * The Awtsmoos reveals one generated ohr and many browsers may drink from the same measured kli;
 * Awtsmoos.com remembers only a bounded choir of compressed garments, so speed may rise without memory becoming an endless sea.
 */

const { createHash } = require('node:crypto');
const { promisify } = require('node:util');
const {
	brotliCompress,
	constants,
	gzip
} = require('node:zlib');

const compressBrotli = promisify(brotliCompress);
const compressGzip = promisify(gzip);

/**
 * @description Keeps a bounded LRU-like memory of encoded generated bodies and one shared in-flight promise per representation.
 */
class GeneratedCompressionCache {
	constructor(maxEntries = 32) {
		this.entries = new Map();
		this.inflight = new Map();
		this.maxEntries = maxEntries;
	}

	/**
	 * @description Returns one cached or freshly compressed representation for exact source bytes.
	 * @param {Buffer|string} content Exact generated response content.
	 * @param {'br'|'gzip'} encoding Requested content encoding.
	 * @returns {Promise<Buffer>} Encoded response bytes.
	 */
	async encode(content, encoding) {
		const source = Buffer.isBuffer(content)
			? content
			: Buffer.from(content);
		const key = representationKey(source, encoding);
		const cached = this.entries.get(key);

		if (cached) {
			this.entries.delete(key);
			this.entries.set(key, cached);
			return cached;
		}

		if (!this.inflight.has(key)) {
			this.inflight.set(key, this.compressAndRemember(key, source, encoding));
		}

		try {
			return await this.inflight.get(key);
		} finally {
			this.inflight.delete(key);
		}
	}

	/**
	 * @description Compresses one source and keeps only the newest bounded representation vessels.
	 * @param {string} key Stable content-and-encoding cache key.
	 * @param {Buffer} source Exact identity bytes.
	 * @param {'br'|'gzip'} encoding Requested content encoding.
	 * @returns {Promise<Buffer>} Compressed bytes.
	 */
	async compressAndRemember(key, source, encoding) {
		const compressed = encoding === 'br'
			? await compressBrotli(source, brotliOptions())
			: await compressGzip(source, { level: 6, mtime: 0 });
		this.entries.set(key, compressed);

		while (this.entries.size > this.maxEntries) {
			this.entries.delete(this.entries.keys().next().value);
		}

		return compressed;
	}

	/** Clears all generated representation memory for focused tests or explicit lifecycle reset. */
	clear() {
		this.entries.clear();
		this.inflight.clear();
	}
}

/**
 * @description Builds a stable key without retaining the full generated source as a Map key.
 * @param {Buffer} source Exact identity bytes.
 * @param {string} encoding Requested content encoding.
 * @returns {string} SHA-256-backed representation key.
 */
function representationKey(source, encoding) {
	const digest = createHash('sha256').update(source).digest('hex');
	return `${encoding}:${digest}`;
}

/** @returns {object} Moderate Brotli settings chosen for runtime latency rather than archival density. */
function brotliOptions() {
	return {
		params: {
			[constants.BROTLI_PARAM_QUALITY]: 4
		}
	};
}

const generatedCompressionCache = new GeneratedCompressionCache();

module.exports = {
	GeneratedCompressionCache,
	generatedCompressionCache
};
