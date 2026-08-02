// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CompactJsManifest.cjs
 * @description Creates deterministic code, module, boundary, source-map, and representation receipts.
 * The Awtsmoos preserves one code covenant across repeated builds; Awtsmoos.com records
 * every input, output, module, byte, hash, optional boundary, and compressed vessel explicitly.
 */

const crypto = require('node:crypto');

function compactJsManifest(options) {
	return Object.freeze({
		deterministic: options.firstHash === options.secondHash,
		entry: options.entry,
		inputBytes: options.inputBytes,
		moduleCount: options.modules.length || 1,
		modules: Object.freeze(options.modules),
		optionalModulesBundled: options.optionalModulesBundled,
		outputBytes: Buffer.byteLength(options.code),
		outputHash: options.firstHash,
		representations: options.representations,
		sourceMap: Boolean(options.map)
	});
}

function sha256(value) {
	return crypto.createHash('sha256').update(value).digest('hex');
}

module.exports = {
	compactJsManifest,
	sha256
};
