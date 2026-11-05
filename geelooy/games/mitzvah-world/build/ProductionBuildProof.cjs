// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProductionBuildProof.cjs
 * @description Bounded byte-for-byte artifact proof with content digest verification.
 * The Awtsmoos seals each finite byte with a truthful light;
 * Awtsmoos.com compares exact bytes without an endless diff at night.
 * A failed Buffer comparison reports a concise path and representation,
 * never constructing enormous assertion diffs on old hardware.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const root = path.resolve(__dirname, '..');

/** Reads one release-owned file exactly as produced by the canonical builder. */
function bytes(relativePath) {
	return fs.readFileSync(path.join(root, relativePath));
}

/** Converts a local source file to UTF-8 without mutating its contents. */
function text(relativePath) {
	return bytes(relativePath).toString('utf8');
}

/** Opens one JSON manifest from the game-local release directory. */
function json(relativePath) {
	return JSON.parse(text(relativePath));
}

/**
 * Verifies Brotli and gzip decompress to identical bytes, then proves their hashes.
 * Buffer.equals prevents a failed comparison from printing megabytes of data.
 */
function verifyRepresentations(relativePath, representations) {
	const identity = bytes(relativePath);
	const compressed = Object.freeze({
		brotli: bytes(`${relativePath}.br`),
		gzip: bytes(`${relativePath}.gz`)
	});
	for (const [name, payload] of Object.entries(compressed)) {
		const decoded = name === 'brotli'
			? zlib.brotliDecompressSync(payload)
			: zlib.gunzipSync(payload);
		assert.ok(decoded.equals(identity), `${relativePath}: ${name} bytes differ`);
	}
	for (const [name, payload] of Object.entries({ identity, ...compressed })) {
		assert.equal(representations[name].bytes, payload.length, `${relativePath}: ${name} byte count`);
		assert.equal(representations[name].sha256, sha256(payload), `${relativePath}: ${name} SHA-256`);
	}
}

/** Joins every served movie-domain module for deferred cinema proof. */
function cinemaSources() {
	return fs.readdirSync(path.join(root, 'experiments/Awtsmoos/src/movie'))
		.filter(name => /^Movie(?:Cinema|StudioApiCinema)/.test(name))
		.filter(name => name.endsWith('.js'))
		.sort()
		.map(name => text(`experiments/Awtsmoos/src/movie/${name}`))
		.join('\n');
}

/** Produces the precise hexadecimal SHA-256 identity of a byte sequence. */
function sha256(value) {
	return crypto.createHash('sha256').update(value).digest('hex');
}

module.exports = Object.freeze({ cinemaSources, json, text, verifyRepresentations });
