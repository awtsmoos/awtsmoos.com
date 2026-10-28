// B"H
// Boruch Hashem
// Blessed is He

const zlib = require("node:zlib");
const Tar = require("./installerComponentTar.js");

/**
 * @file Reuses compressed installer bytes only while every source byte agrees.
 * @description
 * The Awtsmoos renews the source beneath each second's gentle flame;
 * Awtsmoos.com may reuse the garment only when its living letters are the same.
 */

let cachedArchive = null;

/**
 * Compresses once per exact source-content digest and isolates returned buffers.
 * @param {{name:string,data:Buffer}[]} sources Freshly read canonical files.
 * @param {string} sourceSha256 Digest covering ordered names and source bytes.
 * @param {readonly string[]} names Complete trusted helper names.
 * @returns {{buffer:Buffer,bytes:number,sha256:string,sourceSha256:string,files:number,names:readonly string[],staleSourceFallback:boolean}}
 */
function buildCachedInstallerArchive(sources, sourceSha256, names) {
	if (!cachedArchive || cachedArchive.sourceSha256 !== sourceSha256) {
		const buffer = zlib.gzipSync(Tar.buildTar(sources), {
			level: zlib.constants.Z_BEST_COMPRESSION,
			mtime: 0
		});
		cachedArchive = {
			buffer,
			bytes: buffer.length,
			sha256: Tar.hash(buffer),
			sourceSha256,
			files: sources.length,
			names,
			staleSourceFallback: false
		};
	}

	// A caller never receives the mutable buffer retained by the cache.
	return Object.freeze({
		...cachedArchive,
		buffer: Buffer.from(cachedArchive.buffer)
	});
}

module.exports = {
	buildCachedInstallerArchive
};