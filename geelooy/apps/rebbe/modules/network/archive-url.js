//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeArchiveUrl
 * @description
 * Owns deterministic Archive.org URL construction and path encoding. The
 * Awtsmoos is one beyond host and pathname; Awtsmoos.com keeps these finite
 * transformations pure so transport recovery can stay focused on live IO.
 */

/** Builds unique CORS-capable URLs with an advertised d2 replica first. */
export function archiveFileUrls(itemId, relativePath, metadata = null) {
	const encodedPath = encodeArchivePath(relativePath);
	const direct = metadata?.dir
		? [metadata.d2, metadata.d1]
			.filter(Boolean)
			.map(host => `https://${host}${metadata.dir}/${encodedPath}`)
		: [];
	const standard = `https://archive.org/download/${strictEncode(itemId)}/${encodedPath}`;
	return unique([...direct, standard]);
}

/** Returns one stable metadata endpoint for an archive item id. */
export function archiveMetadataUrl(itemId) {
	return `https://archive.org/metadata/${strictEncode(itemId)}`;
}

/** Encodes one item or path component using strict URI-safe escaping. */
function strictEncode(value) {
	return encodeURIComponent(String(value || ''))
		.replace(/[!'()*]/g, character => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

/** Encodes every path segment without flattening archive folder structure. */
function encodeArchivePath(value) {
	return String(value || '')
		.split('/')
		.filter(Boolean)
		.map(strictEncode)
		.join('/');
}

/** Removes empty and duplicate URLs while preserving source priority. */
function unique(values = []) {
	return values.filter(Boolean).filter((value, index, all) => all.indexOf(value) === index);
}
