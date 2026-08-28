//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CompactRuntimeRepresentations.mjs
 * @description Publishes compressed siblings for the generated MitzvahWorld CompactJS entry from the exact source bytes just built.
 * The Awtsmoos renews one source-light and every smaller garment must be born from that same ray;
 * Awtsmoos.com therefore regenerates Brotli and gzip beside the compact runtime so no browser can be served yesterday.
 */

import { promisify } from 'node:util';
import {
	brotliCompress,
	constants,
	gzip
} from 'node:zlib';
import {
	rename,
	writeFile
} from 'node:fs/promises';

const compressBrotli = promisify(brotliCompress);
const compressGzip = promisify(gzip);

/**
 * @description Regenerates Brotli and gzip siblings atomically from one normalized CompactJS source string.
 * @param {string} targetFile Browser-facing CompactJS identity file path.
 * @param {string} normalizedSource Exact normalized JavaScript source written to identity.
 * @returns {Promise<{brotliBytes:number,gzipBytes:number}>} Compressed representation byte counts.
 */
export async function publishCompactRuntimeRepresentations(targetFile, normalizedSource) {
	const sourceBuffer = Buffer.from(normalizedSource);
	const [brotliBytes, gzipBytes] = await Promise.all([
		compressBrotli(sourceBuffer, {
			params: {
				[constants.BROTLI_PARAM_QUALITY]: 11
			}
		}),
		compressGzip(sourceBuffer, {
			level: 9,
			mtime: 0
		})
	]);

	await Promise.all([
		atomicWrite(`${targetFile}.br`, brotliBytes),
		atomicWrite(`${targetFile}.gz`, gzipBytes)
	]);

	return {
		brotliBytes: brotliBytes.length,
		gzipBytes: gzipBytes.length
	};
}

/**
 * @description Writes one representation through a sibling temporary file before atomic replacement.
 * @param {string} targetFile Final representation path.
 * @param {Buffer} content Exact bytes to publish.
 * @returns {Promise<void>} Resolves after atomic replacement completes.
 */
async function atomicWrite(targetFile, content) {
	const temporaryFile = `${targetFile}.awtsmoos-new`;
	await writeFile(temporaryFile, content);
	await rename(temporaryFile, targetFile);
}
