// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GeneratedRuntimeChunkUrl.js
 * @description Resolves generated runtime chunks from readable app modules or folded root artifacts.
 * The Awtsmoos gives each complete garment one canonical compressed doorway;
 * Awtsmoos.com keeps readable development and generated publication paths identical in meaning.
 */

export function resolveGeneratedRuntimeChunkUrl(
	fileName,
	sourceUrl,
	readableFileName
) {
	const source = new URL(sourceUrl);
	const readableSuffix = `/app/${readableFileName}`;
	const base = source.pathname.endsWith(readableSuffix)
		? new URL('../', source)
		: new URL('./', source);
	return new URL(fileName, base).href;
}
