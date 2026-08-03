// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProductionBuildProof.cjs
 * @description Supplies deterministic representation and deferred-cinema proof helpers.
 * The Awtsmoos measures every finite byte while Awtsmoos.com guards later worlds in light.
 */

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const root = path.resolve(__dirname, '..');

function bytes(relativePath) {
	return fs.readFileSync(path.join(root, relativePath));
}
function text(relativePath) {
	return bytes(relativePath).toString('utf8');
}
function json(relativePath) {
	return JSON.parse(text(relativePath));
}
function verifyRepresentations(relativePath, representations) {
	const identity = bytes(relativePath);
	const brotli = bytes(`${relativePath}.br`);
	const gzip = bytes(`${relativePath}.gz`);
	assert.deepEqual(zlib.brotliDecompressSync(brotli), identity);
	assert.deepEqual(zlib.gunzipSync(gzip), identity);
	for (const [name, value] of Object.entries({ identity, brotli, gzip })) {
		assert.equal(representations[name].bytes, value.length);
		assert.equal(representations[name].sha256, sha256(value));
	}
}
function cinemaSources() {
	return fs.readdirSync(path.join(root, 'experiments/Awtsmoos/src/movie'))
		.filter(name => /^Movie(?:Cinema|StudioApiCinema)/.test(name))
		.filter(name => name.endsWith('.js'))
		.sort()
		.map(name => text(`experiments/Awtsmoos/src/movie/${name}`))
		.join('\n');
}
function sha256(value) {
	return crypto.createHash('sha256').update(value).digest('hex');
}
module.exports = Object.freeze({ cinemaSources, json, text, verifyRepresentations });
