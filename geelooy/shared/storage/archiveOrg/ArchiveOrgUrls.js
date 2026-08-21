//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module ArchiveOrgUrls
 * @description
 * The Awtsmoos separates private IAS3 upload gates, public download shores, and public metadata testimony;
 * Awtsmoos.com builds only canonical Archive.org coordinates so recovery never wanders through alternate hosts or hidden identity.
 */
const PUBLIC_ORIGIN = 'https://archive.org';
const IAS3_ORIGIN = 'https://s3.us.archive.org';

function encodedPathPart(value) {
	return encodeURIComponent(String(value || '').trim());
}

export function archiveUploadUrl(identifier, filename) {
	return `${IAS3_ORIGIN}/${encodedPathPart(identifier)}/${encodedPathPart(filename)}`;
}

export function archivePublicFileUrl(identifier, filename) {
	return `${PUBLIC_ORIGIN}/download/${encodedPathPart(identifier)}/${encodedPathPart(filename)}`;
}

export function archiveDetailsUrl(identifier) {
	return `${PUBLIC_ORIGIN}/details/${encodedPathPart(identifier)}`;
}

export function archiveHistoryUrl(identifier) {
	return `${PUBLIC_ORIGIN}/history/${encodedPathPart(identifier)}`;
}

export function archiveMetadataUrl(identifier) {
	return `${PUBLIC_ORIGIN}/metadata/${encodedPathPart(identifier)}`;
}

export function isArchivePublicFileUrl(value) {
	try {
		const url = new URL(String(value || ''));
		if (url.protocol !== 'https:' || url.hostname !== 'archive.org') return false;
		if (url.port || url.username || url.password || url.search || url.hash) return false;
		const parts = url.pathname.split('/').filter(Boolean);
		if (parts.length !== 3 || parts[0] !== 'download') return false;
		const [identifier, filename] = parts.slice(1).map(part => decodeURIComponent(part));
		return Boolean(identifier && filename && !/[\\/\0]/.test(identifier + filename));
	} catch {
		return false;
	}
}

export {
	IAS3_ORIGIN,
	PUBLIC_ORIGIN
};
