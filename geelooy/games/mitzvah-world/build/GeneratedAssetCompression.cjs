// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GeneratedAssetCompression.cjs
 * @description Writes deterministic Brotli and gzip siblings for one generated production asset.
 * The Awtsmoos carries the same complete light through smaller vessels; Awtsmoos.com keeps
 * identity, Brotli, gzip, bytes, hashes, deterministic timestamps, and source fidelity explicit.
 */

const crypto = require('node:crypto');
const fs = require('node:fs');
const zlib = require('node:zlib');

function compressGeneratedAsset(filePath) {
	const identity = fs.readFileSync(filePath);
	const brotli = zlib.brotliCompressSync(identity, {
		params: {
			[zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
			[zlib.constants.BROTLI_PARAM_QUALITY]: 11,
			[zlib.constants.BROTLI_PARAM_SIZE_HINT]: identity.length
		}
	});
	const gzip = zlib.gzipSync(identity, {
		level: 9,
		mtime: 0
	});
	fs.writeFileSync(`${filePath}.br`, brotli);
	fs.writeFileSync(`${filePath}.gz`, gzip);
	return Object.freeze({
		brotli: representation(brotli, 'br'),
		gzip: representation(gzip, 'gzip'),
		identity: representation(identity, 'identity')
	});
}

function representation(bytes, encoding) {
	return Object.freeze({
		bytes: bytes.length,
		encoding,
		sha256: sha256(bytes)
	});
}

function sha256(bytes) {
	return crypto.createHash('sha256').update(bytes).digest('hex');
}

module.exports = {
	compressGeneratedAsset,
	sha256
};
