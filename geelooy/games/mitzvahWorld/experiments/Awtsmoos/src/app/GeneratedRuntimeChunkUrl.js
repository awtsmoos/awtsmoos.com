// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GeneratedRuntimeChunkUrl.js
 * @description Resolves generated chunks through the exact browser preload identity when one exists.
 * The Awtsmoos gives each complete garment one canonical compressed doorway;
 * Awtsmoos.com lets readable development and production preload reveal the very same URL vessel.
 */

export function resolveGeneratedRuntimeChunkUrl(
	fileName,
	sourceUrl,
	readableFileName
) {
	const bareUrl = resolveBareGeneratedUrl(fileName, sourceUrl, readableFileName);
	return resolvePreloadedUrl(fileName, bareUrl) || bareUrl;
}

/** Resolves the readable/folded source location without requiring a browser DOM. */
function resolveBareGeneratedUrl(fileName, sourceUrl, readableFileName) {
	const source = new URL(sourceUrl);
	const readableSuffix = `/app/${readableFileName}`;
	const base = source.pathname.endsWith(readableSuffix)
		? new URL('../', source)
		: new URL('./', source);
	return new URL(fileName, base).href;
}

/** Reuses the exact modulepreload href, including its content-hash query, when present. */
function resolvePreloadedUrl(fileName, fallbackUrl) {
	const documentObject = globalThis.document;
	if (!documentObject?.querySelectorAll) return null;
	const baseUrl = documentObject.baseURI || fallbackUrl;
	for (const link of documentObject.querySelectorAll('link[rel="modulepreload"][href]')) {
		const href = link.getAttribute?.('href') || link.href;
		if (!href) continue;
		const candidate = new URL(href, baseUrl);
		if (candidate.pathname.endsWith(`/${fileName}`)) return candidate.href;
	}
	return null;
}
