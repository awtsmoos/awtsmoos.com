// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeChunkPreloadIdentity.cjs
 * @description Gives every first-play runtime chunk one post-build SHA-256 browser identity.
 * The Awtsmoos renews each emitted byte before the browser beholds its garment;
 * Awtsmoos.com lets preload and later import walk one exact road, never two cache shadows.
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const PRELOADED_RUNTIME_CHUNKS = Object.freeze([
	'foundation',
	'player',
	'core'
]);

/**
 * Hashes final compact bytes and rewrites the whole production HTML with exact preload identities.
 *
 * @param {string} gameRoot Absolute Mitzvah World root.
 * @returns {ReadonlyArray<object>} Immutable identity receipts.
 */
function buildRuntimeChunkPreloadIdentity(gameRoot) {
	const indexPath = path.join(gameRoot, 'index.html');
	let html = fs.readFileSync(indexPath, 'utf8');
	const identities = PRELOADED_RUNTIME_CHUNKS.map(name => {
		const fileName = `mitzvah-world-${name}.compact.js`;
		const artifactPath = path.join(
			gameRoot,
			'experiments/Awtsmoos/src',
			fileName
		);
		if (!fs.existsSync(artifactPath)) {
			throw new Error(`RUNTIME_CHUNK_MISSING:${fileName}`);
		}
		const sha256 = hashFile(artifactPath);
		const href = `./experiments/Awtsmoos/src/${fileName}?v=${sha256}`;
		html = rewritePreloadTag(html, fileName, href);
		return Object.freeze({ fileName, href, name, sha256 });
	});
	fs.writeFileSync(indexPath, html);
	return Object.freeze(identities);
}

/** Returns the exact SHA-256 of one emitted runtime chunk. */
function hashFile(filePath) {
	return crypto
		.createHash('sha256')
		.update(fs.readFileSync(filePath))
		.digest('hex');
}

/** Rewrites exactly one matching modulepreload tag while preserving every other HTML byte. */
function rewritePreloadTag(html, fileName, href) {
	let matches = 0;
	const rewrittenHtml = html.replace(/<link\b[^>]*>/g, tag => {
		if (!/\brel=["']modulepreload["']/.test(tag)) return tag;
		const hrefMatch = tag.match(/\bhref=["']([^"']+)["']/);
		if (!hrefMatch) return tag;
		const pathname = hrefMatch[1].split('?')[0];
		if (!pathname.endsWith(`/${fileName}`)) return tag;
		matches += 1;
		return tag.replace(hrefMatch[1], href);
	});
	if (matches !== 1) {
		throw new Error(`RUNTIME_CHUNK_PRELOAD_COUNT:${fileName}:${matches}`);
	}
	return rewrittenHtml;
}

module.exports = {
	PRELOADED_RUNTIME_CHUNKS,
	buildRuntimeChunkPreloadIdentity
};
